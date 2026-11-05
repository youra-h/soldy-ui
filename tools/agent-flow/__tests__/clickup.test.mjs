import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { api, commentsForTask, config, tasksByStatus } from '../clickup-api.mjs'
import { callTool, listTools } from '../protocol.mjs'

const originalFetch = globalThis.fetch
const originalToken = process.env.CLICKUP_TOKEN
const chunkSize = config.commentChunkSize
let requests
let respond
const task = (id, status = 'in progress', extra = {}) => ({
	id,
	name: id,
	status: { status, type: 'custom' },
	tags: [],
	date_created: '1',
	...extra,
})

beforeEach(() => {
	process.env.CLICKUP_TOKEN = 'pk_test_only'
	requests = []
	respond = () => {
		throw new Error('Unexpected HTTP request; live network is forbidden in tests')
	}
	globalThis.fetch = async (url, options = {}) => {
		const request = {
			path: new URL(url).pathname.replace('/api/v2', '') + new URL(url).search,
			method: options.method ?? 'GET',
			body: options.body ? JSON.parse(options.body) : null,
		}
		requests.push(request)
		return new Response(JSON.stringify(await respond(request)), { status: 200 })
	}
})
afterEach(() => {
	globalThis.fetch = originalFetch
	config.commentChunkSize = chunkSize
	if (originalToken === undefined) delete process.env.CLICKUP_TOKEN
	else process.env.CLICKUP_TOKEN = originalToken
})

test('invalid role, arguments and tool names cannot cause HTTP writes', async () => {
	for (const [name, args] of [
		['clickup_take', { task_id: 'a', role: 'manager' }],
		['clickup_take', { role: 'developer' }],
		['clickup_get_task', { task_id: '../other' }],
		['clickup_move', { task_id: 'a', role: 'manager', status: 'overview', hold: 'yes' }],
		['__proto__', {}],
	])
		await assert.rejects(callTool(name, args))
	assert.equal(requests.length, 0)
	assert.equal(listTools().filter((tool) => tool.annotations.readOnlyHint).length, 3)
})

test('queues paginate and keep unset priority with normal, oldest first', async () => {
	respond = (request) => {
		assert.match(request.path, /include_closed=true/)
		return request.path.endsWith('page=0')
			? {
					tasks: [
						task('low', 'planning', { priority: { priority: 'low' } }),
						task('normal', 'planning', { date_created: '9' }),
					],
					last_page: false,
				}
			: {
					tasks: [
						task('urgent', 'planning', { priority: { priority: 'urgent' } }),
						task('normal-old', 'planning', {
							date_created: '2',
							priority: { priority: 'normal' },
						}),
					],
					last_page: true,
				}
	}
	assert.deepEqual(
		(await tasksByStatus('planning')).map((item) => item.id),
		['urgent', 'normal-old', 'normal', 'low'],
	)
	assert.equal(requests.length, 2)
})

test('all comments are paginated using both cursor fields', async () => {
	const first = Array.from({ length: 25 }, (_, index) => ({
		id: String(50 - index),
		date: String(100 - index),
		comment_text: 'old plan',
	}))
	respond = (request) =>
		request.path.includes('?')
			? { comments: [{ id: '1', date: '1', comment_text: 'first owner decision' }] }
			: { comments: first }
	assert.equal((await commentsForTask('a')).length, 26)
	assert.match(requests[1].path, /start=76&start_id=26/)
	requests = []
	const history = await callTool('clickup_get_comments', { task_id: 'a' })
	assert.equal(history[0].text, 'first owner decision')
})

test('a non-advancing comment cursor fails rather than returning partial history', async () => {
	respond = () => ({
		comments: Array.from({ length: 25 }, (_, index) => ({ id: String(index), date: '1' })),
	})
	await assert.rejects(commentsForTask('a'), /did not advance/)
})

test('unreadable dependencies remain blocked', async () => {
	respond = (request) => {
		if (request.path === '/task/a')
			return task('a', 'planning', { dependencies: [{ task_id: 'a', depends_on: 'b' }] })
		throw new Error('Blocker is inaccessible')
	}
	const result = await callTool('clickup_get_task', { task_id: 'a' })
	assert.equal(result.blocked, true)
	assert.equal(result.waitingOn[0].closed, false)
})

test('claiming a busy task is rejected without writes', async () => {
	respond = () => task('a', 'in progress', { tags: [{ name: 'on' }] })
	await assert.rejects(
		callTool('clickup_take', { task_id: 'a', role: 'developer' }),
		/already busy/,
	)
	assert.ok(requests.every((request) => request.method === 'GET'))
})

test('handoff validates outcomes and releases busy only after status update', async () => {
	respond = (request) =>
		request.method === 'GET' ? task('a', 'approved', { tags: [{ name: 'on' }] }) : {}
	await assert.rejects(
		callTool('clickup_handoff', { task_id: 'a', role: 'developer', outcome: 'ready' }),
		/cannot hand off/,
	)
	assert.equal(requests.length, 0)
	await callTool('clickup_handoff', { task_id: 'a', role: 'developer', outcome: 'done' })
	assert.equal(requests[0].method, 'PUT')
	assert.equal(requests[0].body.status, 'approved')
	assert.equal(requests.at(-1).method, 'DELETE')
	assert.match(requests.at(-1).path, /tag\/on$/)
})

test('owner size tags and manager busy guards are enforced', async () => {
	respond = () => task('a', 'planning', { tags: [{ name: 'on' }, { name: 'hard' }] })
	await assert.rejects(
		callTool('clickup_set_size', { task_id: 'a', role: 'techlead', size: 'simple' }),
		/already set/,
	)
	await assert.rejects(
		callTool('clickup_set_priority', { task_id: 'a', role: 'manager', priority: 'urgent' }),
		/busy/,
	)
	assert.ok(requests.every((request) => request.method === 'GET'))
})

test('overview owner-reply and held-task dependency guards survive migration', async () => {
	respond = (request) =>
		request.path.endsWith('/comment')
			? { comments: [{ comment_text: '#DEV\nNeed owner decision' }] }
			: task('a', 'overview')
	await assert.rejects(
		callTool('clickup_move', { task_id: 'a', role: 'manager', status: 'planning' }),
		/awaits an owner/,
	)
	respond = (request) =>
		request.path === '/task/a'
			? task('a', 'overview', {
					tags: [{ name: 'hold' }],
					dependencies: [{ task_id: 'a', depends_on: 'b' }],
				})
			: task('b', 'approved')
	await assert.rejects(
		callTool('clickup_move', { task_id: 'a', role: 'manager', status: 'planning' }),
		/still waits/,
	)
	assert.ok(requests.every((request) => request.method === 'GET'))
})

test('each split report part retains its role hashtag and stays within the configured limit', async () => {
	config.commentChunkSize = 100
	respond = () => ({})
	const result = await callTool('clickup_add_comment', {
		task_id: 'a',
		role: 'developer',
		text: 'important result\n'.repeat(25),
	})
	assert.ok(result.posted > 1)
	assert.ok(
		requests.every(
			(request) =>
				request.body.comment_text.startsWith('#DEV\n\n') &&
				request.body.comment_text.length <= 100,
		),
	)
})

test('follow-up task stays in source list and overview, with a separate role plan', async () => {
	respond = (request) =>
		request.method === 'GET'
			? task('source', 'in progress', {
					list: { id: 'list1' },
					url: 'https://app.clickup.com/t/source',
				})
			: request.path === '/list/list1/task'
				? { id: 'new', url: 'https://app.clickup.com/t/new' }
				: {}
	await callTool('clickup_create_task', {
		source_task_id: 'source',
		role: 'developer',
		name: 'Separate work',
		description: 'Owner-facing reason',
		plan: 'Executor steps',
	})
	assert.equal(requests[1].body.status, 'overview')
	assert.match(requests[1].body.description, /Owner-facing reason/)
	assert.match(requests[2].body.comment_text, /^#DEV\n\nExecutor steps/)
})

test('invalid tokens are not echoed into diagnostics', async () => {
	process.env.CLICKUP_TOKEN = 'private_invalid_value'
	await assert.rejects(
		api('/user'),
		(failure) => !failure.message.includes('private_invalid_value'),
	)
	assert.equal(requests.length, 0)
})
