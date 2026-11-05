import { randomUUID } from 'node:crypto'
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmdirSync,
	unlinkSync,
	writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { poolSnapshot } from './pool.mjs'

export function taskId(id) {
	if (!/^[a-zA-Z0-9_-]+$/.test(id ?? '')) throw new Error('A valid task ID is required')
	return id
}

function readLease(path) {
	try {
		const lease = JSON.parse(readFileSync(join(path, 'lease.json'), 'utf8'))
		return typeof lease?.task === 'string' && typeof lease?.token === 'string' ? lease : null
	} catch {
		// Interrupted or foreign records are preserved, never treated as owned.
		return null
	}
}
function lock(path, lease) {
	mkdirSync(path)
	try {
		writeFileSync(join(path, 'lease.json'), JSON.stringify(lease), { flag: 'wx' })
		writeFileSync(join(path, 'task'), lease.task, { flag: 'wx' })
	} catch (failure) {
		for (const name of ['lease.json', 'task'])
			if (existsSync(join(path, name))) unlinkSync(join(path, name))
		rmdirSync(path)
		throw failure
	}
}

function candidate(snapshot, id) {
	const matching = snapshot.rows.find((row) => row.branch.startsWith(`task/${id}-`))
	if (matching) {
		if (matching.missing || matching.locked)
			throw new Error(`Task worktree unavailable: ${matching.path}`)
		return matching
	}
	const row = snapshot.rows.find((row) => row.free)
	if (!row)
		throw new Error(
			'No available pool worktree. The owner will restore soldy-* folders; do not create replacements.',
		)
	return row
}

export function acquireLease(cwd, id, writing = false) {
	taskId(id)
	const snapshot = poolSnapshot(cwd)
	const row = writing ? candidate(snapshot, id) : null
	mkdirSync(snapshot.locks, { recursive: true })
	const lease = { token: randomUUID(), task: id, createdAt: new Date().toISOString() }
	const taskLock = join(snapshot.locks, `task-${id}`)
	lock(taskLock, lease)
	try {
		if (row) lock(join(snapshot.locks, row.name), lease)
	} catch (failure) {
		releaseLease(cwd, lease.token)
		throw failure
	}
	return { ...lease, taskLock, workspace: row?.path ?? null, resumed: row?.dirty ?? false }
}

export function leaseWorkspace(cwd, token) {
	const snapshot = poolSnapshot(cwd)
	const lease = findLease(snapshot, token)
	const owned = snapshot.rows.find(
		(row) => readLease(join(snapshot.locks, row.name))?.token === token,
	)
	if (owned?.missing) throw new Error(`Leased worktree is missing: ${owned.path}`)
	if (owned) return { ...lease, workspace: owned.path, resumed: owned.dirty }
	const row = candidate(snapshot, lease.task)
	lock(join(snapshot.locks, row.name), lease)
	return { ...lease, workspace: row.path, resumed: row.dirty }
}

function findLease(snapshot, token) {
	if (!/^[a-f0-9-]{36}$/.test(token ?? '')) throw new Error('A valid lease token is required')
	for (const entry of readdirSync(snapshot.locks, { withFileTypes: true })) {
		if (!entry.isDirectory() || !entry.name.startsWith('task-')) continue
		const lease = readLease(join(snapshot.locks, entry.name))
		if (lease?.token === token) return lease
	}
	throw new Error('Lease not found; do not remove another run lock')
}

export function releaseLease(cwd, token) {
	const snapshot = poolSnapshot(cwd)
	findLease(snapshot, token)
	const released = []
	for (const entry of readdirSync(snapshot.locks, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		const path = join(snapshot.locks, entry.name)
		if (readLease(path)?.token !== token) continue
		if (readdirSync(path).some((name) => !['lease.json', 'task'].includes(name)))
			throw new Error(`Unexpected lock contents: ${path}`)
		unlinkSync(join(path, 'task'))
		unlinkSync(join(path, 'lease.json'))
		rmdirSync(path)
		released.push(path)
	}
	return { released }
}

export function unlockTask(cwd, id) {
	taskId(id)
	const snapshot = poolSnapshot(cwd)
	const path = join(snapshot.locks, `task-${id}`)
	const lease = readLease(path)
	if (lease && lease.task !== id) throw new Error('Lock contents do not match the requested task')
	if (!lease)
		return {
			released: [],
			note: 'No recorded lease; preserve unrecognized legacy locks. Check ClickUp on manually.',
		}
	return {
		...releaseLease(cwd, lease.token),
		note: 'Local lease released. ClickUp status and on tag were not changed.',
	}
}
