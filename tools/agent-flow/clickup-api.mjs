/** Shared REST access; credentials are independent of the AI host. */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const credentialsPath = () =>
	process.env.CLICKUP_CREDENTIALS_FILE ??
	join(homedir(), '.config', 'soxa-agent-flow', 'credentials.json')
export const config = JSON.parse(
	readFileSync(process.env.CLICKUP_CONFIG ?? join(here, 'config.json'), 'utf8'),
)

export function clickupToken() {
	const file = credentialsPath()
	const token =
		process.env.CLICKUP_TOKEN ??
		(existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).CLICKUP_TOKEN : undefined)
	if (typeof token !== 'string' || !token.startsWith('pk_'))
		throw new Error(
			'Set a valid CLICKUP_TOKEN or private credentials file; expected pk_ prefix.',
		)
	return token
}

export async function api(path, options = {}) {
	const token = clickupToken()
	const response = await fetch(`https://api.clickup.com/api/v2${path}`, {
		...options,
		signal: options.signal ?? AbortSignal.timeout(30000),
		headers: { Authorization: token, 'Content-Type': 'application/json', ...options.headers },
	})
	const body = await response.text()
	if (!response.ok)
		throw new Error(
			`ClickUp ${response.status} ${path}: ${body.replaceAll(token, '[redacted]').slice(0, 500)}`,
		)
	return body ? JSON.parse(body) : {}
}

export function requireConfig(field) {
	if (!config[field]) throw new Error(`Missing config.json field: ${field}`)
	return config[field]
}

export const PRIORITIES = ['urgent', 'high', 'normal', 'low']
const priorityRank = (task) => {
	const rank = PRIORITIES.indexOf(task.priority?.priority)
	return rank === -1 ? PRIORITIES.indexOf('normal') : rank
}
export const queueOrder = (a, b) =>
	priorityRank(a) - priorityRank(b) || Number(a.date_created) - Number(b.date_created)

export async function tasksByStatus(status) {
	const filter = `statuses%5B%5D=${encodeURIComponent(status)}&subtasks=true&include_closed=true`
	const path = config.spaceId
		? `/team/${requireConfig('teamId')}/task?space_ids%5B%5D=${config.spaceId}&${filter}`
		: `/list/${requireConfig('listId')}/task?${filter}`
	const tasks = []
	for (let page = 0; ; page++) {
		const { tasks: chunk = [], last_page } = await api(`${path}&page=${page}`)
		tasks.push(...chunk)
		if (
			last_page === true ||
			chunk.length === 0 ||
			(last_page === undefined && chunk.length < 100)
		)
			break
	}
	return tasks.sort(queueOrder)
}

/** ClickUp returns 25 newest comments; both cursor fields are required. */
export async function commentsForTask(id) {
	const result = []
	const seen = new Set()
	let query = ''
	for (;;) {
		const { comments = [] } = await api(`/task/${id}/comment${query}`)
		if (!comments.length) return result
		const unseen = comments.filter((comment) => !seen.has(comment.id))
		if (!unseen.length)
			throw new Error('ClickUp comment pagination did not advance; history is incomplete.')
		for (const comment of unseen) {
			result.push(comment)
			seen.add(comment.id)
		}
		if (comments.length < 25) return result
		const last = comments.at(-1)
		if (!last?.date || !last.id) throw new Error('ClickUp returned an invalid comment cursor.')
		query = `?start=${encodeURIComponent(last.date)}&start_id=${encodeURIComponent(last.id)}`
	}
}
