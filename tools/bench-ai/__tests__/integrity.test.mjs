import test from 'node:test'
import assert from 'node:assert/strict'
import { acceptObservation, checkCohort, requiredHarnessFiles } from '../integrity.mjs'

const record = (name, changes = {}) => ({
	name,
	execution: { originalExitCode: 1, signal: null, error: null },
	result: {
		commit: 'same-commit',
		libraryDirtyState: '',
		os: { platform: 'linux', release: 'same', arch: 'x64', cpu: 'same' },
		runtimeVersions: { vue: '3', vite: '8', playwright: '1', 'axe-core': '4' },
		lockHash: 'a'.repeat(64),
		harnessSourceHashes: Object.fromEntries(
			requiredHarnessFiles.map((file) => [file, 'b'.repeat(64)]),
		),
		status: 'tested-with-failures',
		candidate: name === 'Soxa' ? 'soxa' : 'fixture.vue',
		sourceHash: 'b'.repeat(64),
		cells: [{ engine: 'chromium', browser: 'same-browser', status: 'failed' }],
		...changes,
	},
})

test('component failures and compiler failures remain honest comparable observations', () => {
	const result = checkCohort(
		[record('Soxa'), record('model', { status: 'compile-failed', cells: [] })],
		2,
	)
	assert.equal(result.status, 'valid')
})

test('mixed OS, dependencies, workload source or browser cannot form one cohort', () => {
	for (const changes of [
		{ os: { platform: 'win32', release: 'same', arch: 'x64', cpu: 'same' } },
		{ lockHash: 'c'.repeat(64) },
		{
			harnessSourceHashes: Object.fromEntries(
				requiredHarnessFiles.map((file) => [file, 'd'.repeat(64)]),
			),
		},
		{ runtimeVersions: { vue: 'different', vite: '8', playwright: '1', 'axe-core': '4' } },
		{ cells: [{ engine: 'chromium', browser: 'different', status: 'passed' }] },
	])
		assert.equal(checkCohort([record('Soxa'), record('model', changes)], 2).status, 'invalid')
})

test('tampered or unverified generation inputs never export passing cells', () => {
	const valid = {
		component: 'tabs',
		metadata: {
			component: 'tabs',
			status: 'generated',
			sourceHash: 'source',
			promptHash: 'prompt',
		},
		observed: {
			status: 'tested-with-gaps',
			sourceHash: 'source',
			cells: [{ status: 'passed' }],
		},
		sourceHash: 'source',
		promptHash: 'prompt',
		execution: { originalExitCode: 0, signal: null, error: null },
	}
	assert.equal(acceptObservation(valid).results.length, 1)
	for (const changes of [
		{ sourceHash: 'modified' },
		{ promptHash: 'modified' },
		{ metadata: null },
		{ component: 'dialog' },
		{ sourceHash: null },
	]) {
		const result = acceptObservation({ ...valid, ...changes })
		assert.equal(result.status, 'invalid-input')
		assert.deepEqual(result.results, [])
	}
})

test('missing metadata is invalid and missing subjects or unfinished runs remain incomplete', () => {
	assert.equal(checkCohort([record('Soxa'), record('model', { os: null })], 2).status, 'invalid')
	assert.equal(checkCohort([record('Soxa')], 2).status, 'incomplete')
	assert.equal(
		checkCohort([record('Soxa'), record('model', { status: 'runner-failed', cells: [] })], 2)
			.status,
		'incomplete',
	)
})
