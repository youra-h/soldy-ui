import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { auditData, auditRun, stats } from '../audit.mjs'

function removeFixture(directory) {
	const real = fs.realpathSync(directory)
	assert.equal(path.dirname(real), fs.realpathSync(os.tmpdir()))
	assert.match(path.basename(real), /^soxa-(validation|diagnostic)-test-/)
	fs.rmSync(real, { recursive: true, force: true })
}

const sample = (delta = 0) => ({
	heap: 100000 + delta * 100,
	components: 10 + delta,
	emitters: 20 + delta,
	nodes: 30 + delta,
	listeners: 40 + delta,
})
const page = (leak = false, n = 3) => ({
	base: sample(),
	end: sample(leak ? n : 0),
	errors: 0,
	cycles: Array.from({ length: n }, () => ({
		time: 10,
		actions: 1,
		before: sample(),
		mounted: sample(10),
		after: sample(),
	})),
})
const pages = () => ({
	framework: 'vue',
	date: '2026-11-09T05:00:01Z',
	n: 2,
	act: 1,
	warm: 1,
	cycles: 2,
	rounds: 1,
	settle: 100,
	errors: [],
	tour: null,
	pages: { empty: page(), button: page(), leak: page(true) },
})
test('real page schema accepts controls and measurements', () =>
	assert.equal(auditData('pages', pages(), { smoke: true }).status, 'measured'))
test('hidden browser error is not made green by process exit zero', () => {
	const data = pages()
	data.errors.push('console.error: failure')
	assert.equal(auditData('pages', data, { smoke: true }).status, 'failed')
})
test('planted leak must be detected', () => {
	const data = pages()
	data.pages.leak.end = sample()
	assert(
		auditData('pages', data, { smoke: true }).findings.includes(
			'planted leak was not detected',
		),
	)
})
test('empty control growth invalidates measurement', () => {
	const data = pages()
	data.pages.empty.end = sample(3)
	assert(
		auditData('pages', data, { smoke: true }).findings.includes(
			'empty control accumulated counters',
		),
	)
})
test('NaN serialized as null is a failed measurement', () => {
	const data = pages()
	data.pages.button.base.heap = null
	assert.equal(auditData('pages', data, { smoke: true }).status, 'failed')
})
test('missing cycles are rejected', () => {
	const data = pages()
	data.pages.button.cycles.pop()
	assert.equal(auditData('pages', data, { smoke: true }).status, 'failed')
})
test('independent registry catches page omitted from both result and tour', () => {
	const data = pages()
	Object.assign(data, {
		n: 50,
		act: 10,
		warm: 2,
		cycles: 20,
		tour: [{ button: {} }, { button: {} }, { button: {} }],
	})
	for (const id of ['button', 'all', 'empty', 'leak']) data.pages[id] = page(id === 'leak', 22)
	const findings = auditData('pages', data, { expectedPages: ['button', 'select'] }).findings
	assert(findings.includes('missing page select'))
	assert(findings.includes('tour 1: missing select'))
})
test('median averages the middle pair and preserves min/max/N', () =>
	assert.deepEqual(stats([7, 1, 3, 5]), { n: 4, median: 4, min: 1, max: 7 }))
test('missing framework, corrupt JSON and stale raw stay distinct', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'soxa-validation-test-'))
	try {
		const manifest = {
			id: 'fixture',
			smoke: true,
			commands: [
				{
					name: 'pages-vue',
					started: '2026-11-09T05:00:00Z',
					exitCode: 0,
					outputs: [{ file: 'pages-vue.json' }],
				},
			],
		}
		fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest))
		fs.writeFileSync(path.join(directory, 'pages-vue.json'), JSON.stringify(pages()))
		let audit = auditRun(directory, ['pages'])
		assert.equal(audit.cells['pages/react'].status, 'not-run')
		assert.equal(audit.valid, false)
		fs.writeFileSync(path.join(directory, 'pages-vue.json'), '{bad json')
		audit = auditRun(directory, ['pages'])
		assert.equal(audit.cells['pages/vue'].status, 'failed')
		const data = pages()
		data.date = '2026-11-08T00:00:00Z'
		fs.writeFileSync(path.join(directory, 'pages-vue.json'), JSON.stringify(data))
		assert(
			auditRun(directory, ['pages']).cells['pages/vue'].findings.includes(
				'raw result predates command',
			),
		)
		data.date = 'not-a-date'
		fs.writeFileSync(path.join(directory, 'pages-vue.json'), JSON.stringify(data))
		assert(
			auditRun(directory, ['pages']).cells['pages/vue'].findings.includes(
				'invalid raw result date',
			),
		)
		manifest.commands[0].started = 'not-a-date'
		fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest))
		assert(
			auditRun(directory, ['pages']).cells['pages/vue'].findings.includes(
				'invalid command start date',
			),
		)
	} finally {
		removeFixture(directory)
	}
})
test('foreign table participant is forbidden', () => {
	const result = auditData(
		'table',
		{
			n: 20,
			participants: { plain: { values: {}, repetitions: [], errors: [], failure: null } },
		},
		{ smoke: true },
	)
	assert(result.findings.includes('non-Soxa participant forbidden'))
})
test('soak early finish and missing planted control cannot pass', () => {
	const data = {
		seed: 7,
		transitions: [],
		points: [
			{ ...sample(), minutes: 0, transitions: 0 },
			{ ...sample(), minutes: 0.05, transitions: 1 },
		],
		errors: [],
	}
	const findings = auditData('control', data, { smoke: true }).findings
	assert(findings.includes('session ended early'))
	assert(findings.includes('planted soak leak was not detected'))
})
test('exact settle methodology is required', () => {
	const data = pages()
	data.settle = 0
	assert(auditData('pages', data, { smoke: true }).findings.includes('wrong page settle'))
})
test('SSR requires all locale references and each intermediate sample', () => {
	const ssrPage = (id) => ({
		framework: 'vue',
		page: id,
		components: id === 'empty' ? [] : ['button', 'date-picker'],
		options: { renders: 18, warm: 6, every: 3, settle: 100 },
		start: { ...sample(), renders: 0, time: 0 },
		samples: Array.from({ length: 6 }, (_, i) => ({
			...sample(),
			renders: (i + 1) * 3,
			time: 1,
		})),
		settled: { ...sample(id === 'leak' ? 18 : 0), renders: 18, time: 0 },
		sizes: Object.fromEntries(
			['ru-RU', 'en-US', 'ar-EG'].map((locale) => [locale, id === 'empty' ? 0 : 100]),
		),
		references: Object.fromEntries(
			['ru-RU', 'en-US', 'ar-EG'].map((locale) => [
				locale,
				id === 'empty' ? [`no string of ${locale}`, 'no date segments'] : [],
			]),
		),
		mismatches: 0,
	})
	const data = {
		framework: 'vue',
		pages: Object.fromEntries(['empty', 'all', 'leak'].map((id) => [id, ssrPage(id)])),
	}
	assert.equal(auditData('ssr', data, { smoke: true }).status, 'measured')
	delete data.pages.all.references['ar-EG']
	data.pages.all.samples.splice(2, 1)
	const findings = auditData('ssr', data, { smoke: true }).findings
	assert(findings.includes('all/ar-EG: missing language references/markup'))
	assert(findings.includes('all: missing SSR sample intervals'))
	data.pages.empty.references['ru-RU'].push('strings of en-US: unexpected foreign content')
	assert(
		auditData('ssr', data, { smoke: true }).findings.some((finding) =>
			finding.includes('empty/ru-RU: strings of en-US'),
		),
	)
})
test('wrong framework and missing virtual suffix are rejected', () => {
	const data = {
		n: 20,
		participants: {
			'react:soxa+fit=none+width=3248+track': {
				values: {},
				repetitions: [],
				errors: [],
				failure: null,
			},
		},
	}
	const findings = auditData('virtual', data, { smoke: true, framework: 'vue' }).findings
	assert(findings.includes('wrong framework/table variant participant'))
	assert(findings.includes('wrong table virtual suffix'))
})
test('table metrics with correct repetition count still require finite paint/settled', () => {
	const data = {
		n: 20,
		participants: {
			'soxa+fit=none+width=3248+track': {
				values: { Рендер: [{ paint: 'oops' }] },
				repetitions: [],
				errors: [],
				failure: null,
			},
		},
	}
	assert(
		auditData('table', data, { smoke: true, framework: 'vue' }).findings.includes(
			'Рендер: non-numeric table measurement',
		),
	)
})
test('legitimate stopped:null in soak is not a missing numeric measurement', () => {
	const data = {
		seed: 7,
		n: 2,
		act: 1,
		every: 5,
		settle: 100,
		minutes: 0.1,
		pages: ['button', 'all'],
		transitions: [
			{ page: 'button', copies: 2, act: 1, steps: 1, skipped: 0, locales: 0, stopped: null },
		],
		points: [
			{ ...sample(), minutes: 0, transitions: 0 },
			{ ...sample(), minutes: 0.1, transitions: 1 },
		],
		errors: [],
	}
	assert.equal(
		auditData('soak', data, { smoke: true, expectedPages: ['button'] }).status,
		'measured',
	)
})
test('process exit zero cannot hide a stderr error diagnostic', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'soxa-diagnostic-test-'))
	try {
		fs.writeFileSync(
			path.join(directory, 'manifest.json'),
			JSON.stringify({
				id: 'fixture',
				smoke: true,
				commands: [
					{
						name: 'pages-vue',
						started: '2026-11-09T05:00:00Z',
						exitCode: 0,
						outputs: [{ file: 'pages-vue.json' }],
					},
				],
			}),
		)
		fs.writeFileSync(path.join(directory, 'pages-vue.json'), JSON.stringify(pages()))
		fs.writeFileSync(
			path.join(directory, 'pages-vue.txt'),
			'ReferenceError: listener crashed\n',
		)
		assert.equal(auditRun(directory, ['pages']).cells['pages/vue'].status, 'failed')
	} finally {
		removeFixture(directory)
	}
})
