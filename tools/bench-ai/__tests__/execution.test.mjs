import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { acceptObservation, checkExecution } from '../integrity.mjs'

const passed = { status: 'tested-with-gaps', sourceHash: 'source', cells: [{ status: 'passed' }] }
const failed = { status: 'tested-with-failures', cells: [{ status: 'failed' }] }
const exit = (originalExitCode, extra = {}) => ({
	originalExitCode,
	signal: null,
	error: null,
	...extra,
})

test('normal component and compile failures remain complete observations with exit one', () => {
	assert.equal(checkExecution(exit(0), passed).status, 'complete')
	assert.equal(checkExecution(exit(1), failed).status, 'complete')
	for (const status of ['compile-failed', 'runtime-failed', 'protocol-violation'])
		assert.equal(checkExecution(exit(1), { status, cells: [] }).status, 'complete')
})

test('timeout, signals, spawn errors and missing exits cannot authenticate saved passing cells', () => {
	for (const execution of [
		null,
		exit(null, { error: 'ETIMEDOUT', signal: 'SIGTERM' }),
		exit(0, { signal: 'SIGTERM' }),
		exit(0, { error: 'ENOENT' }),
		exit(1),
		exit(null),
	]) {
		assert.equal(checkExecution(execution, passed).status, 'incomplete')
		const accepted = acceptObservation({
			component: 'tabs',
			metadata: {
				component: 'tabs',
				status: 'generated',
				sourceHash: 'source',
				promptHash: 'prompt',
			},
			sourceHash: 'source',
			promptHash: 'prompt',
			observed: passed,
			execution,
		})
		assert.equal(accepted.status, 'incomplete-execution')
		assert.deepEqual(accepted.results, [])
	}
})

test('a normal exit cannot make an unfinished or failed host runner complete', () => {
	for (const status of ['pending', 'runner-failed', 'invalid-input', 'not-run'])
		assert.equal(checkExecution(exit(0), { status, cells: [] }).status, 'incomplete')
})

test('a real process that saves passing results then hangs is rejected after timeout', () => {
	const child = spawnSync(
		process.execPath,
		[
			'-e',
			`process.stdout.write(${JSON.stringify(JSON.stringify(passed))}); setInterval(() => {}, 1000)`,
		],
		{ encoding: 'utf8', timeout: 200, killSignal: 'SIGTERM' },
	)
	assert.equal(child.error?.code, 'ETIMEDOUT')
	const saved = JSON.parse(child.stdout)
	const completion = checkExecution(
		{ originalExitCode: child.status, signal: child.signal, error: child.error?.code },
		saved,
	)
	assert.equal(completion.status, 'incomplete')
})
