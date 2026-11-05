import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { acquireLease, leaseWorkspace, releaseLease, unlockTask } from '../leases.mjs'
import { poolSnapshot } from '../pool.mjs'

test('absent pool stops writer before claiming or creating task locks; no worktree is created', (t) => {
	const root = mkdtempSync(join(tmpdir(), 'soldy-flow-'))
	t.after(() => rmSync(root, { recursive: true, force: true }))
	execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'pipe' })
	const before = execFileSync('git', ['-C', root, 'worktree', 'list', '--porcelain'], {
		encoding: 'utf8',
	})
	assert.throws(() => acquireLease(root, 'task1', true), /No available pool/)
	assert.equal(existsSync(join(root, '.git', 'agent-locks', 'task-task1')), false)
	assert.equal(
		execFileSync('git', ['-C', root, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' }),
		before,
	)
	const lease = acquireLease(root, 'task1')
	assert.throws(() => leaseWorkspace(root, lease.token), /No available pool/)
	releaseLease(root, lease.token)
})

test('local leases exclude a second runner and release only the owner token', (t) => {
	const root = mkdtempSync(join(tmpdir(), 'soldy-flow-'))
	t.after(() => rmSync(root, { recursive: true, force: true }))
	execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'pipe' })
	const first = acquireLease(root, 'task1')
	const other = acquireLease(root, 'task2')
	const corrupted = join(poolSnapshot(root).locks, 'task-000-unrelated')
	mkdirSync(corrupted)
	writeFileSync(join(corrupted, 'lease.json'), '{interrupted')
	assert.throws(() => acquireLease(root, 'task1'), /EEXIST/)
	assert.throws(() => releaseLease(root, '00000000-0000-0000-0000-000000000000'), /not found/)
	releaseLease(root, first.token)
	assert.equal(existsSync(first.taskLock), false)
	assert.equal(existsSync(other.taskLock), true)
	assert.equal(readFileSync(join(corrupted, 'lease.json'), 'utf8'), '{interrupted')
	const folder = join(poolSnapshot(root).locks, 'soldy-a')
	mkdirSync(folder)
	writeFileSync(join(folder, 'lease.json'), readFileSync(join(other.taskLock, 'lease.json')))
	writeFileSync(join(folder, 'task'), 'task2')
	unlockTask(root, 'task2')
	assert.equal(existsSync(folder), false)
	assert.equal(existsSync(other.taskLock), false)
})

test('unknown lock content and invalid IDs are preserved rather than recursively removed', (t) => {
	const root = mkdtempSync(join(tmpdir(), 'soldy-flow-'))
	t.after(() => rmSync(root, { recursive: true, force: true }))
	execFileSync('git', ['init', '--initial-branch=main', root], { stdio: 'pipe' })
	assert.throws(() => acquireLease(root, '../escape'), /valid task ID/)
	const lease = acquireLease(root, 'task1')
	writeFileSync(join(lease.taskLock, 'owner-note'), 'preserve')
	assert.throws(() => releaseLease(root, lease.token), /Unexpected lock contents/)
	assert.equal(existsSync(join(lease.taskLock, 'owner-note')), true)
})
