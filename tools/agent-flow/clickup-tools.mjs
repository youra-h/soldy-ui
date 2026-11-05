#!/usr/bin/env node
import {
	api,
	commentsForTask,
	config,
	PRIORITIES,
	requireConfig,
	tasksByStatus,
} from './clickup-api.mjs'

const HASHTAGS = {
	analyst: '#ANALYSIS',
	techlead: '#PLANNING',
	designer: '#DESIGN',
	developer: '#DEV',
	manager: '#MANAGE',
}
const textOf = (comment) => (comment.comment_text ?? '').trimStart()
const isRoleComment = (comment) =>
	Object.values(HASHTAGS).some((tag) => textOf(comment).startsWith(tag))
const SIZES = ['simple', 'normal', 'hard']
const sizeTagsOf = (tags) => tags.filter((tag) => SIZES.includes(tag))
function sizeOf(tags) {
	const found = sizeTagsOf(tags)
	if (found.length === 0) return 'normal'
	return found.reduce((a, b) => (SIZES.indexOf(a) > SIZES.indexOf(b) ? a : b))
}
const BUSY = 'on'
const FREE = 'off'
const HOLD = 'hold'
const tagPath = (taskId, tag) => `/task/${taskId}/tag/${encodeURIComponent(tag)}`
async function setBusy(taskId, tags, busy) {
	const [add, remove] = busy ? [BUSY, FREE] : [FREE, BUSY]
	if (!tags.includes(add)) await api(tagPath(taskId, add), { method: 'POST' })
	if (tags.includes(remove)) await api(tagPath(taskId, remove), { method: 'DELETE' })
}
const tagsOf = (task) => (task.tags ?? []).map((tag) => tag.name.toLowerCase())
const TRANSITIONS = {
	analyst: { done: 'planning', questions: 'overview' },
	techlead: { ready: 'inProgress', design: 'design', questions: 'overview', done: 'approved' },
	designer: { done: 'approved', questions: 'planning' },
	developer: { done: 'approved', questions: 'overview' },
}
const MANAGER_MOVES = {
	overview: ['planning', 'inProgress'],
	planning: ['overview'],
	inProgress: ['planning', 'overview'],
}
const statusKeyOf = (task) =>
	Object.keys(config.statuses).find((key) => config.statuses[key] === task.status?.status)
const waitingOnIds = (task) =>
	(task.dependencies ?? []).filter((dep) => dep.task_id === task.id).map((dep) => dep.depends_on)
const blockingIds = (task) =>
	(task.dependencies ?? []).filter((dep) => dep.depends_on === task.id).map((dep) => dep.task_id)
const linkedIds = (task) =>
	(task.linked_tasks ?? []).map((link) =>
		link.task_id === task.id ? link.link_id : link.task_id,
	)
const isClosed = (task) =>
	['closed', 'done'].includes(task.status?.type) || task.status?.status === config.statuses.closed
async function blockersOf(tasks) {
	const ids = [...new Set(tasks.flatMap(waitingOnIds))]
	const found = await Promise.all(ids.map((id) => api(`/task/${id}`).catch(() => null)))
	return new Map(found.filter(Boolean).map((task) => [task.id, task]))
}
function trimTask(task, blockers = new Map()) {
	const tags = tagsOf(task)
	const waitingOn = waitingOnIds(task).map((id) => {
		const blocker = blockers.get(id)
		return {
			id,
			name: blocker?.name ?? null,
			status: blocker?.status?.status ?? null,
			closed: blocker ? isClosed(blocker) : false,
		}
	})
	return {
		id: task.id,
		name: task.name,
		status: task.status?.status ?? null,
		priority: task.priority?.priority ?? null,
		size: sizeOf(tags),
		sizeTagged: sizeTagsOf(tags).length > 0,
		busy: tags.includes(BUSY),
		hold: tags.includes(HOLD),
		blocked: waitingOn.some((dep) => !dep.closed),
		waitingOn,
		blocking: blockingIds(task),
		linked: linkedIds(task),
		url: task.url,
		description: task.description || task.text_content || '',
		assignees: (task.assignees ?? []).map((user) => user.username),
		tags,
		parent: task.parent ?? null,
	}
}
function trimComment(comment) {
	return {
		id: comment.id,
		author: comment.user?.username ?? 'unknown',
		date: new Date(Number(comment.date)).toISOString(),
		text: comment.comment_text ?? '',
	}
}
function chunk(text, size) {
	if (text.length <= size) return [text]
	const parts = []
	let rest = text
	while (rest.length > size) {
		const cut = rest.lastIndexOf('\n', size)
		const at = cut > size * 0.5 ? cut : size
		parts.push(rest.slice(0, at))
		rest = rest.slice(at)
	}
	parts.push(rest)
	return parts.map((part, index) => `${part}\n\n_(part ${index + 1}/${parts.length})_`)
}
async function postComment(taskId, role, text) {
	const hashtag = HASHTAGS[role]
	if (!hashtag) {
		throw new Error(`Unknown role "${role}". Expected: ${Object.keys(HASHTAGS).join(', ')}`)
	}
	const trimmed = text.trimStart()
	const body = trimmed.startsWith(hashtag) ? trimmed.slice(hashtag.length).trimStart() : trimmed
	const parts = chunk(body, Math.max(1, (config.commentChunkSize ?? 30000) - hashtag.length - 40))
	for (const part of parts) {
		await api(`/task/${taskId}/comment`, {
			method: 'POST',
			body: JSON.stringify({ comment_text: `${hashtag}\n\n${part}`, notify_all: false }),
		})
	}
	return parts.length
}
async function managedTask(taskId, role) {
	if (role !== 'manager') {
		throw new Error(
			`Role "${role}" cannot manage task priority or status; use the manager role.`,
		)
	}
	const task = await api(`/task/${taskId}`)
	if (tagsOf(task).includes(BUSY)) {
		throw new Error(`Task ${taskId} is busy (tag "${BUSY}"); do not modify it.`)
	}
	const key = statusKeyOf(task)
	if (!MANAGER_MOVES[key]) {
		const scope = Object.keys(MANAGER_MOVES).map((k) => config.statuses[k])
		throw new Error(
			`Task ${taskId} has status "${task.status?.status}". Manager scope: ${scope.join(', ')}.`,
		)
	}
	return { task, key }
}
export const tools = {
	clickup_get_task: {
		schema: {
			type: 'object',
			properties: { task_id: { type: 'string' } },
			required: ['task_id'],
		},
		async run({ task_id }) {
			const task = await api(`/task/${task_id}`)
			return trimTask(task, await blockersOf([task]))
		},
	},
	clickup_get_comments: {
		schema: {
			type: 'object',
			properties: { task_id: { type: 'string' } },
			required: ['task_id'],
		},
		async run({ task_id }) {
			const comments = await commentsForTask(task_id)
			return comments.map(trimComment).reverse()
		},
	},
	clickup_add_comment: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: Object.keys(HASHTAGS),
				},
				text: { type: 'string' },
			},
			required: ['task_id', 'role', 'text'],
		},
		async run({ task_id, role, text }) {
			return { posted: await postComment(task_id, role, text) }
		},
	},
	clickup_take: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: Object.keys(TRANSITIONS),
				},
			},
			required: ['task_id', 'role'],
		},
		async run({ task_id, role }) {
			if (!TRANSITIONS[role]) {
				throw new Error(
					`Unknown role "${role}". Expected: ${Object.keys(TRANSITIONS).join(', ')}`,
				)
			}
			const tags = tagsOf(await api(`/task/${task_id}`))
			if (tags.includes(BUSY)) {
				throw new Error(
					`Task ${task_id} is already busy (tag "${BUSY}"); stop without taking it.`,
				)
			}
			await setBusy(task_id, tags, true)
			if (tags.includes(HOLD)) await api(tagPath(task_id, HOLD), { method: 'DELETE' })
			return { taken: task_id, tag: BUSY }
		},
	},
	clickup_handoff: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: Object.keys(TRANSITIONS),
				},
				outcome: {
					type: 'string',
					enum: [...new Set(Object.values(TRANSITIONS).flatMap(Object.keys))],
				},
			},
			required: ['task_id', 'role', 'outcome'],
		},
		async run({ task_id, role, outcome }) {
			const allowed = TRANSITIONS[role]
			if (!allowed) {
				throw new Error(
					`Unknown role "${role}". Expected: ${Object.keys(TRANSITIONS).join(', ')}`,
				)
			}
			const key = allowed[outcome]
			if (!key) {
				throw new Error(
					`Role "${role}" cannot hand off with outcome "${outcome}". Expected: ${Object.keys(allowed).join(', ')}`,
				)
			}
			const status = config.statuses[key]
			const owner = Number(requireConfig('ownerId'))
			await api(`/task/${task_id}`, {
				method: 'PUT',
				body: JSON.stringify({ status, assignees: { add: [owner] } }),
			})
			await setBusy(task_id, tagsOf(await api(`/task/${task_id}`)), false)
			return { status, assigned_to: owner, tag: FREE }
		},
	},
	clickup_set_size: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: ['techlead'],
				},
				size: { type: 'string', enum: SIZES },
			},
			required: ['task_id', 'role', 'size'],
		},
		async run({ task_id, role, size }) {
			if (role !== 'techlead') {
				throw new Error(`Role "${role}" cannot set size; respect the current size field.`)
			}
			if (!SIZES.includes(size)) {
				throw new Error(`Unknown size "${size}". Expected: ${SIZES.join(', ')}`)
			}
			const existing = sizeTagsOf(tagsOf(await api(`/task/${task_id}`)))
			if (existing.length > 0) {
				throw new Error(
					`Size is already set by tag "${existing.join(', ')}"; preserve the owner choice.`,
				)
			}
			await api(tagPath(task_id, size), { method: 'POST' })
			return { size }
		},
	},
	clickup_set_priority: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: ['manager'],
				},
				priority: { type: 'string', enum: PRIORITIES },
			},
			required: ['task_id', 'role', 'priority'],
		},
		async run({ task_id, role, priority }) {
			if (!PRIORITIES.includes(priority)) {
				throw new Error(
					`Unknown priority "${priority}". Expected: ${PRIORITIES.join(', ')}`,
				)
			}
			const { task } = await managedTask(task_id, role)
			const was = task.priority?.priority ?? null
			if (was !== priority) {
				await api(`/task/${task_id}`, {
					method: 'PUT',
					body: JSON.stringify({ priority: PRIORITIES.indexOf(priority) + 1 }),
				})
			}
			return { priority, was }
		},
	},
	clickup_move: {
		schema: {
			type: 'object',
			properties: {
				task_id: { type: 'string' },
				role: {
					type: 'string',
					enum: ['manager'],
				},
				status: {
					type: 'string',
					enum: Object.keys(MANAGER_MOVES).map((key) => config.statuses[key]),
				},
				hold: {
					type: 'boolean',
				},
			},
			required: ['task_id', 'role', 'status'],
		},
		async run({ task_id, role, status, hold = false }) {
			const { task, key } = await managedTask(task_id, role)
			const target = MANAGER_MOVES[key].find((to) => config.statuses[to] === status)
			if (!target) {
				const allowed = MANAGER_MOVES[key].map((to) => config.statuses[to])
				throw new Error(
					`From "${task.status.status}" manager can move only to: ${allowed.join(', ')}.`,
				)
			}
			if (hold && target !== 'overview') {
				throw new Error('Set hold only when moving to OVERVIEW.')
			}
			const tagged = tagsOf(task).includes(HOLD)
			const held = key === 'overview' && tagged
			const open = trimTask(task, await blockersOf([task]))
				.waitingOn.filter((dep) => !dep.closed)
				.map((dep) => dep.id)
			if (hold && open.length === 0) {
				throw new Error(
					`Task ${task_id} has no open dependencies. Add a waits_on dependency before deferring it.`,
				)
			}
			if (held) {
				if (target !== 'planning') {
					throw new Error(
						`Task ${task_id} is deferred (tag "${HOLD}"); return only to PLANNING for plan review.`,
					)
				}
				if (open.length > 0) {
					throw new Error(
						`Task ${task_id} still waits for: ${open.join(', ')}; do not return it yet.`,
					)
				}
			}
			if ((key === 'overview' && !held) || target === 'inProgress') {
				const comments = await commentsForTask(task_id)
				if (key === 'overview' && !held) {
					const last = comments.find(
						(comment) => !textOf(comment).startsWith(HASHTAGS.manager),
					)
					if (!last || isRoleComment(last)) {
						throw new Error(
							`Task ${task_id} awaits an owner response after the last role comment; leave it in OVERVIEW.`,
						)
					}
				}
				if (target === 'inProgress') {
					if (
						!comments.some((comment) => textOf(comment).startsWith(HASHTAGS.techlead))
					) {
						throw new Error(
							`Task ${task_id} has no plan ${HASHTAGS.techlead}; planning is required before implementation.`,
						)
					}
					if (open.length > 0) {
						throw new Error(
							`Task ${task_id} waits for open tasks: ${open.join(', ')}; do not start implementation.`,
						)
					}
				}
			}
			const owner = Number(requireConfig('ownerId'))
			await api(`/task/${task_id}`, {
				method: 'PUT',
				body: JSON.stringify({
					status: config.statuses[target],
					assignees: { add: [owner] },
				}),
			})
			const keep = target === 'overview' && hold
			if (keep && !tagged) await api(tagPath(task_id, HOLD), { method: 'POST' })
			if (!keep && tagged) await api(tagPath(task_id, HOLD), { method: 'DELETE' })
			return { status: config.statuses[target], was: task.status.status, hold: keep }
		},
	},
	clickup_link_tasks: {
		schema: {
			type: 'object',
			properties: {
				task_id: {
					type: 'string',
				},
				role: {
					type: 'string',
					enum: ['manager', 'techlead'],
				},
				relation: {
					type: 'string',
					enum: ['waits_on', 'related'],
				},
				other_task_id: {
					type: 'string',
				},
			},
			required: ['task_id', 'role', 'relation', 'other_task_id'],
		},
		async run({ task_id, role, relation, other_task_id }) {
			if (role !== 'manager' && role !== 'techlead') {
				throw new Error(`Role "${role}" cannot link tasks.`)
			}
			if (relation !== 'waits_on' && relation !== 'related') {
				throw new Error(`Unknown relation "${relation}". Expected: waits_on, related`)
			}
			if (task_id === other_task_id) {
				throw new Error('Cannot link a task to itself.')
			}
			const task = await api(`/task/${task_id}`)
			if (role === 'manager' && tagsOf(task).includes(BUSY)) {
				throw new Error(`Task ${task_id} is busy (tag "${BUSY}"); do not modify it.`)
			}
			const result = { task_id, relation, other_task_id }
			if (relation === 'related') {
				if (linkedIds(task).includes(other_task_id)) return { ...result, already: true }
				await api(`/task/${task_id}/link/${other_task_id}`, { method: 'POST' })
				return result
			}
			if (waitingOnIds(task).includes(other_task_id)) return { ...result, already: true }
			if (blockingIds(task).includes(other_task_id)) {
				throw new Error(
					`${other_task_id} already waits for ${task_id}; a reverse dependency would create a cycle.`,
				)
			}
			await api(`/task/${task_id}/dependency`, {
				method: 'POST',
				body: JSON.stringify({ depends_on: other_task_id }),
			})
			return result
		},
	},
	clickup_list_by_status: {
		schema: {
			type: 'object',
			properties: {
				status: {
					type: 'string',
				},
			},
			required: ['status'],
		},
		async run({ status }) {
			const tasks = await tasksByStatus(status)
			const blockers = await blockersOf(tasks)
			return tasks.map((task) => trimTask(task, blockers))
		},
	},
	clickup_create_task: {
		schema: {
			type: 'object',
			properties: {
				source_task_id: {
					type: 'string',
				},
				role: {
					type: 'string',
					enum: ['techlead', 'developer'],
				},
				name: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				plan: {
					type: 'string',
				},
				size: {
					type: 'string',
					enum: SIZES,
				},
			},
			required: ['source_task_id', 'role', 'name', 'description', 'plan'],
		},
		async run({ source_task_id, role, name, description, plan, size }) {
			if (!['techlead', 'developer'].includes(role)) {
				throw new Error(`Role "${role}" cannot create tasks.`)
			}
			if (size && !SIZES.includes(size)) {
				throw new Error(`Unknown size "${size}". Expected: ${SIZES.join(', ')}`)
			}
			const source = await api(`/task/${source_task_id}`)
			const listId = source.list?.id ?? config.listId
			if (!listId) {
				throw new Error(`Cannot determine list for task ${source_task_id}`)
			}
			const owner = Number(requireConfig('ownerId'))
			const origin = `\n\nSplit from task "${source.name}" during ${HASHTAGS[role]}: ${source.url}`
			const created = await api(`/list/${listId}/task`, {
				method: 'POST',
				body: JSON.stringify({
					name,
					description: description + origin,
					status: config.statuses.overview,
					assignees: [owner],
					tags: size ? [size, FREE] : [FREE],
					notify_all: false,
				}),
			})
			await postComment(created.id, role, plan)
			return { id: created.id, url: created.url, status: config.statuses.overview }
		},
	},
}

const descriptions = {
	clickup_get_task:
		'Read task details, size, busy/hold state, dependencies and links. Unreadable dependencies remain blocked.',
	clickup_get_comments:
		'Read the complete comment history in chronological order before working on a task.',
	clickup_add_comment:
		'Post a role comment. The server adds the role hashtag and splits long text. Call before handoff.',
	clickup_take:
		'Claim a task with the on tag. Stop if already busy. Handoff releases it. Tags are not an atomic lock.',
	clickup_handoff:
		'Finish the stage after posting a report. analyst: done->planning, questions->overview; techlead: ready->in progress, design->design, questions->overview, done->approved; designer: done->approved, questions->planning; developer: done->approved, questions->overview. Releases the on tag.',
	clickup_set_size:
		'Techlead only: set simple/normal/hard when no size tag exists; never overwrite the owner size.',
	clickup_set_priority:
		'Manager only: set priority on a non-busy task in planning, in progress or overview.',
	clickup_move:
		'Manager only: move non-busy tasks within the allowed workflow. hold=true requires open dependencies and overview; deferred tasks return only to planning after blockers close. Other overview exits require an owner reply. Implementation requires a planning comment and no open blockers.',
	clickup_link_tasks:
		'Manager or techlead: waits_on means task_id waits for other_task_id; related is non-blocking. Manager cannot change busy tasks. Self links and direct dependency cycles are rejected. No unlink operation.',
	clickup_list_by_status:
		'Read tasks ordered urgent/high/normal/low (unset=normal), then oldest first. Skip busy or blocked tasks for automatic selection.',
	clickup_create_task:
		'Techlead or developer: create a follow-up in the source list, assigned to the owner in overview. description is plain language for the owner; plan is posted as a role comment. Does not replace the current report.',
}
for (const [name, tool] of Object.entries(tools)) tool.description = descriptions[name]
