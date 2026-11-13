import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { slope } from '../bench-pages/measure.mjs'
import { judge } from '../bench-ssr/verdict.mjs'
import { defaultStages, validatedStages } from './stages.mjs'

export const auditedPages = [
	'alert',
	'badge',
	'breadcrumbs',
	'separator',
	'toggle-button',
	'toggle-group',
	'code-block',
	'avatar',
	'avatar-group',
	'alert-dialog',
]
export const frameworks = ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']
const counters = ['components', 'emitters', 'nodes', 'listeners']
export const interactionActions = {
	alert: ['dismiss'],
	breadcrumbs: ['open', 'close'],
	'toggle-button': ['press', 'release'],
	'toggle-group': ['choose first', 'clear first'],
	'code-block': ['snippet two', 'copy', 'snippet one'],
	'alert-dialog': ['open', 'close', 'cancel', 'confirm'],
	select: ['open', 'close', 'type'],
	menu: ['open', 'close'],
	'date-picker': ['open', 'close', 'locale ru', 'locale en'],
	dialog: ['open', 'close'],
	input: ['type'],
	tabs: ['tab 2', 'tab 1'],
	calendar: ['locale ru', 'locale en'],
	'number-input': ['locale ru', 'locale en'],
}
export const stats = (list) => {
	const sorted = [...list].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return {
		n: list.length,
		median: list.length
			? list.length % 2
				? sorted[mid]
				: (sorted[mid - 1] + sorted[mid]) / 2
			: null,
		min: sorted[0] ?? null,
		max: sorted.at(-1) ?? null,
	}
}
const finite = (value) => typeof value === 'number' && Number.isFinite(value)
function numeric(value, at, findings) {
	if (value === null || (typeof value === 'number' && !Number.isFinite(value)))
		findings.push(`${at}: null/non-finite value`)
	else if (Array.isArray(value))
		value.forEach((entry, index) => numeric(entry, `${at}/${index}`, findings))
	else if (value && typeof value === 'object')
		for (const [key, entry] of Object.entries(value)) {
			if (
				['error', 'failure', 'tour', 'renders', 'writes', 'inp', 'stopped'].includes(key) &&
				entry === null
			)
				continue
			numeric(entry, `${at}/${key}`, findings)
		}
}
export function auditData(stage, result, { smoke = false, expectedPages, framework } = {}) {
	const findings = []
	const metrics = {}
	const require = (condition, text) => {
		if (!condition) findings.push(text)
	}
	numeric(result, stage, findings)
	if (Array.isArray(result.errors) && result.errors.length)
		findings.push(`${result.errors.length} page errors`)
	const sample = (m, label) => {
		for (const key of stage === 'ssr'
			? ['heap', 'components', 'emitters']
			: ['heap', ...counters])
			require(finite(m?.[key]) && m[key] >= 0, `${label}/${key}: missing numeric measurement`)
		if (stage === 'ssr')
			require(finite(m?.time) && m.time >= 0, `${label}/time: missing numeric render timing`)
	}
	if (stage === 'pages') {
		require(result.n === (smoke ? 2 : 50) &&
			result.act === (smoke ? 1 : 10), 'wrong copies/active copies')
		require(result.cycles === (smoke ? 2 : 20) &&
			result.warm === (smoke ? 1 : 2), 'wrong cycle count')
		require(result.settle === (smoke ? 100 : 6000), 'wrong page settle')
		require(result.rounds === (smoke ? 1 : 3), 'wrong tour rounds')
		const expected = smoke
			? ['empty', 'button', 'leak']
			: [...(expectedPages ?? []), 'all', 'empty', 'leak']
		if (!smoke) {
			require(Array.isArray(expectedPages) &&
				expectedPages.length > 0, 'missing independent expected page registry')
			require(result.tour?.length === 3, 'missing full component tour')
			for (const [index, tour] of (result.tour ?? []).entries())
				for (const id of expectedPages ?? []) {
					require(Boolean(tour[id]), `tour ${index + 1}: missing ${id}`)
					if (tour[id])
						for (const phase of ['before', 'mounted', 'after'])
							sample(tour[id][phase], `tour ${index + 1}/${id}/${phase}`)
				}
		}
		for (const id of expected) {
			const page = result.pages?.[id]
			if (!page) {
				findings.push(`missing page ${id}`)
				continue
			}
			require(page.cycles?.length === result.warm + result.cycles, `${id}: missing cycles`)
			sample(page.base, `${id}/base`)
			sample(page.end, `${id}/end`)
			for (const [index, cycle] of page.cycles.entries()) {
				sample(cycle.before, `${id}/${index}/before`)
				sample(cycle.mounted, `${id}/${index}/mounted`)
				sample(cycle.after, `${id}/${index}/after`)
				require(finite(cycle.time) && cycle.time >= 0, `${id}: invalid mount time`)
				if (auditedPages.includes(id)) {
					require(cycle.actions > 0, `${id}: audited scenario executed no actions`)
					for (const phase of ['updateTime', 'unmountTime'])
						require(finite(cycle[phase]) &&
							cycle[phase] >= 0, `${id}: missing ${phase}`)
				}
				require(finite(cycle.actions) &&
					cycle.actions >= 0, `${id}: invalid scenario action count`)
			}
			const measured = page.cycles.slice(result.warm)
			const growth = Object.fromEntries(
				counters.map((key) => [key, page.end[key] - page.base[key]]),
			)
			metrics[id] = {
				mountMs: stats(measured.map((c) => c.time)),
				updateMs: stats(measured.map((c) => c.updateTime).filter(finite)),
				unmountMs: stats(measured.map((c) => c.unmountTime).filter(finite)),
				scenarioActions: stats(measured.map((c) => c.actions)),
				weightBytes: stats(measured.map((c) => c.mounted.heap - c.before.heap)),
				heapBytesPerCycle: slope(measured.map((c) => c.after.heap)),
				growth,
			}
		}
		const noise = Math.max(4096, 3 * Math.abs(metrics.empty?.heapBytesPerCycle ?? 0))
		for (const metric of Object.values(metrics))
			metric.verdict = counters.some((key) => metric.growth[key] >= result.cycles / 2)
				? 'counter-growth'
				: metric.heapBytesPerCycle > noise
					? 'heap-growth'
					: 'no-growth-detected'
		require(metrics.leak &&
			counters.some(
				(key) => metrics.leak.growth[key] >= result.cycles / 2,
			), 'planted leak was not detected')
		require(metrics.empty &&
			!counters.some(
				(key) => metrics.empty.growth[key] >= result.cycles / 2,
			), 'empty control accumulated counters')
		if (!smoke && result.tour?.length && expectedPages?.length) {
			const lastId = expectedPages.at(-1)
			const ends = result.tour.map((tour) => tour[lastId]?.after)
			if (ends.every(Boolean))
				metrics.tour = {
					endpoints: ends,
					growth: Object.fromEntries(
						['heap', ...counters].map((key) => [key, ends.at(-1)[key] - ends[0][key]]),
					),
					note: 'Immediate endpoints, not settled; transient timers can retain objects. No leak verdict from tour alone.',
				}
		}
	} else if (stage === 'soak' || stage === 'control') {
		require(result.seed === 7, 'wrong soak seed')
		require(result.n === (smoke ? 2 : 50) &&
			result.act === (smoke ? 1 : 10), 'wrong soak copies/active copies')
		require(result.every === (smoke || stage === 'control' ? 5 : 50), 'wrong soak interval')
		require(result.settle === (smoke ? 100 : 6000), 'wrong soak settle')
		require(result.minutes ===
			(smoke ? 0.1 : stage === 'control' ? 1 : 30), 'wrong requested soak duration')
		const expected = stage === 'control' ? ['leak'] : [...(expectedPages ?? []), 'all']
		require(result.pages?.length === expected.length &&
			expected.every((id) => result.pages.includes(id)), 'wrong soak page registry')
		require(result.points?.length >= 2, 'missing soak points')
		for (const [index, point] of (result.points ?? []).entries()) {
			sample(point, 'point')
			require(finite(point.minutes) &&
				point.minutes >= 0 &&
				Number.isInteger(point.transitions) &&
				point.transitions >= 0, 'invalid soak point coordinates')
			if (index)
				require(point.transitions > result.points[index - 1].transitions &&
					point.minutes >=
						result.points[index - 1].minutes, 'unordered soak measurements')
		}
		const first = result.points?.[0],
			last = result.points?.at(-1)
		require(last?.minutes >=
			(smoke ? 0.1 : stage === 'control' ? 1 : 30), 'session ended early')
		require(result.transitions?.length > 0 &&
			result.transitions.every(Boolean), 'failed/missing transitions')
		for (const transition of result.transitions?.filter(Boolean) ?? []) {
			require(expected.includes(transition.page) &&
				Number.isInteger(transition.copies) &&
				transition.copies >= 1 &&
				transition.copies <= result.n &&
				Number.isInteger(transition.act) &&
				transition.act >= 1 &&
				transition.act <=
					Math.min(transition.copies, result.act), 'invalid soak transition workload')
			for (const key of ['steps', 'skipped', 'locales'])
				require(Number.isInteger(transition[key]) &&
					transition[key] >= 0, `invalid soak transition ${key}`)
		}
		require(last?.transitions === result.transitions?.length, 'missing final soak measurement')
		if (first && last) {
			const k = Math.max(1, Math.min(3, Math.floor(result.points.length / 2)))
			const least = (points, key) => Math.min(...points.map((p) => p[key]))
			const growth = Object.fromEntries(
				counters.map((key) => [
					key,
					least(result.points.slice(-k), key) - least(result.points.slice(0, k), key),
				]),
			)
			metrics.session = {
				minutes: last.minutes,
				transitions: result.transitions.length,
				points: result.points.length,
				heapStart: first.heap,
				heapEnd: last.heap,
				heapBytesPerTransition: slope(
					result.points.map((p) => p.heap),
					result.points.map((p) => p.transitions),
				),
				growth,
			}
			metrics.session.verdict = counters.some((key) => growth[key] > 0)
				? 'counter-growth'
				: metrics.session.heapBytesPerTransition > 4096
					? 'heap-growth'
					: 'no-growth-detected'
			if (stage === 'control')
				require(counters.some(
					(key) => growth[key] > 0,
				), 'planted soak leak was not detected')
		}
	} else if (stage === 'interaction') {
		require(result.n === (smoke ? 2 : 50), 'wrong interaction copies')
		require(result.warm === (smoke ? 1 : 2) &&
			result.reps === (smoke ? 1 : 10) &&
			result.countReps === (smoke ? 1 : 3), 'wrong interaction repetitions metadata')
		require(JSON.stringify(result.rates) ===
			JSON.stringify(smoke ? [1] : [1, 4, 6]), 'wrong interaction CPU rates')
		for (const [id, actions] of Object.entries(interactionActions))
			for (const rate of smoke ? [1] : [1, 4, 6])
				for (const action of actions) {
					const samples = result.timing?.[id]?.[rate]?.[action]
					require(samples?.length ===
						(smoke ? 1 : 10), `${id}/${rate}/${action}: missing timing repetitions`)
					for (const sample of samples ?? []) {
						require(!sample.error, `${id}/${rate}/${action}: ${sample.error}`)
						for (const key of ['paint', 'settled'])
							require(finite(
								sample[key],
							), `${id}/${rate}/${action}/${key}: missing timing`)
					}
					if (samples?.length)
						metrics[`${id}/${rate}/${action}`] = {
							paintMs: stats(samples.map((s) => s.paint)),
							settledMs: stats(samples.map((s) => s.settled)),
							inpMs: stats(samples.map((s) => s.inp).filter(finite)),
						}
					for (const size of [result.n, 1]) {
						const counted = result.renders?.[id]?.[size]?.[action]
						require(counted?.length ===
							(smoke ? 1 : 3), `${id}/${size}/${action}: missing render repetitions`)
						for (const sample of counted ?? [])
							require(!sample.error &&
								['mount', 'update', 'tick'].every(
									(key) =>
										finite(sample.renders?.[key]) && sample.renders[key] >= 0,
								), `${id}/${size}/${action}: invalid render measurement`)
						if (counted?.length) {
							for (const sample of counted)
								for (const key of ['acted', 'others', 'outside'])
									require(finite(
										sample.writes?.[key],
									), `${id}/${size}/${action}: invalid DOM writes`)
							metrics[`count/${id}/${size}/${action}`] = {
								renders: Object.fromEntries(
									['mount', 'update', 'tick'].map((key) => [
										key,
										stats(counted.map((s) => s.renders?.[key]).filter(finite)),
									]),
								),
								writes: Object.fromEntries(
									['acted', 'others', 'outside'].map((key) => [
										key,
										stats(counted.map((s) => s.writes?.[key]).filter(finite)),
									]),
								),
							}
						}
					}
				}
	} else if (stage === 'ssr') {
		for (const id of ['empty', 'all', 'leak']) {
			const page = result.pages?.[id]
			if (!page) {
				findings.push(`missing SSR page ${id}`)
				continue
			}
			require(Array.isArray(page.components) &&
				(id === 'empty'
					? page.components.length === 0
					: page.components.length > 0), `${id}: invalid SSR component workload`)
			require(page.options.renders ===
				(smoke ? 18 : id === 'leak' ? 600 : 3000), `${id}: wrong render count`)
			require(page.options.warm === (smoke ? 6 : id === 'leak' ? 150 : 600) &&
				page.options.every === (smoke ? 3 : 150) &&
				page.options.settle ===
					(smoke ? 100 : 3000), `${id}: wrong SSR methodology metadata`)
			require(page.samples.length === page.options.renders / page.options.every &&
				page.samples.every(
					(s, index) => s.renders === (index + 1) * page.options.every,
				), `${id}: missing SSR sample intervals`)
			require(page.samples.at(-1)?.renders ===
				page.options.renders, `${id}: incomplete renders`)
			require(page.mismatches === 0, `${id}: ${page.mismatches} markup mismatches`)
			for (const [locale, problems] of Object.entries(page.references)) {
				const unexpected = problems.filter(
					(problem) =>
						id !== 'empty' ||
						![`no string of ${locale}`, 'no date segments'].includes(problem),
				)
				require(unexpected.length === 0, `${id}/${locale}: ${unexpected.join('; ')}`)
			}
			for (const locale of ['ru-RU', 'en-US', 'ar-EG'])
				require(Array.isArray(page.references[locale]) &&
					finite(page.sizes[locale]) &&
					(id === 'empty'
						? page.sizes[locale] >= 0
						: page.sizes[locale] >
							0), `${id}/${locale}: missing language references/markup`)
			for (const point of [page.start, ...page.samples, page.settled]) sample(point, id)
			metrics[id] = {
				...judge(page, result.pages.empty),
				heapBytes: page.settled.heap,
				renderMs: stats(
					page.samples.filter((s) => s.renders > page.options.warm).map((s) => s.time),
				),
				mismatches: page.mismatches,
			}
		}
		require(metrics.leak?.verdict === 'leak', 'planted SSR leak was not detected')
		require(metrics.empty?.verdict === 'clean', 'SSR empty control not clean')
	} else if (stage === 'table' || stage === 'virtual') {
		require(result.n === (smoke ? 20 : stage === 'virtual' ? 10000 : 5000), 'wrong table rows')
		require(result.runs === (smoke ? 1 : 3), 'wrong table repetition metadata')
		require(Object.keys(result.participants ?? {}).length ===
			1, 'expected one Soxa participant')
		for (const [name, participant] of Object.entries(result.participants ?? {})) {
			require(/^(?:(?:react|angular|svelte|solid|webc):)?soxa\+fit=none\+width=3248\+track(?:\+virtual)?$/.test(
				name,
			), 'non-Soxa participant forbidden')
			const expectedName = `${framework && framework !== 'vue' ? framework + ':' : ''}soxa+fit=none+width=3248+track${stage === 'virtual' ? '+virtual' : ''}`
			if (framework)
				require(name === expectedName, 'wrong framework/table variant participant')
			require(name.endsWith('+virtual') ===
				(stage === 'virtual'), 'wrong table virtual suffix')
			require(!participant.failure, `table failure: ${participant.failure}`)
			require(participant.errors?.length === 0, 'table page errors')
			require(participant.repetitions?.length ===
				(smoke ? 1 : 3), 'missing table observable repetitions')
			for (const repeat of participant.repetitions ?? []) {
				require(finite(repeat.mounted?.rows) &&
					repeat.mounted.rows > 0, 'table has no visible rows')
				if (stage === 'table')
					require(repeat.mounted.rows === result.n &&
						repeat.selected?.checked ===
							result.n, 'table did not render/select all data rows')
				else
					require(repeat.selected?.checked >
						0, 'virtual table selection did not reach visible rows')
				require(repeat.deselected?.checked === 0, 'table deselection failed')
				require(typeof repeat.ascending?.first === 'string' &&
					typeof repeat.descending?.first === 'string' &&
					repeat.ascending.first !==
						repeat.descending.first, 'table sorting did not change visible order')
			}
			for (const key of [
				'Рендер',
				'Выделить все',
				'Снять выделение',
				'Сортировка ↑',
				'Сортировка ↓',
				'Замена данных',
				'Размонтирование',
				'Память, МБ',
				'Память после, сборка вне стека, МБ',
				...(stage === 'virtual'
					? ['Прокрутка до конца', 'Память после прокрутки, МБ']
					: []),
			]) {
				const values = participant.values?.[key]
				require(values?.length === (smoke ? 1 : 3), `${key}: missing table repetitions`)
				const memory = key.startsWith('Память')
				for (const value of values ?? [])
					require(memory
						? finite(value)
						: finite(value?.paint) &&
								value.paint >= 0 &&
								finite(value?.settled) &&
								value.settled >= 0, `${key}: non-numeric table measurement`)
				if (values?.length)
					metrics[key] =
						typeof values[0] === 'number'
							? stats(values)
							: {
									paintMs: stats(values.map((s) => s.paint)),
									settledMs: stats(values.map((s) => s.settled)),
								}
			}
		}
	} else findings.push(`unknown stage ${stage}`)
	return { status: findings.length ? 'failed' : 'measured', findings, metrics }
}

export function auditRun(directory, stages) {
	const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'))
	stages = validatedStages(stages ?? manifest.stages ?? defaultStages)
	const registryFile = path.join(directory, 'registry.json')
	const expected = fs.existsSync(registryFile)
		? JSON.parse(fs.readFileSync(registryFile, 'utf8')).pages
		: {}
	const cells = {}
	for (const stage of stages)
		for (const fw of frameworks) {
			if (stage === 'ssr' && fw === 'webc') {
				cells[`${stage}/${fw}`] = {
					status: 'not-applicable',
					reason: 'No Web Components SSR renderer',
				}
				continue
			}
			const file = path.join(directory, `${stage}-${fw}.json`)
			try {
				const result = JSON.parse(fs.readFileSync(file, 'utf8'))
				const audited = auditData(stage, result, {
					smoke: manifest.smoke,
					expectedPages: expected[fw],
					framework: fw,
				})
				if (!manifest.smoke && ['pages', 'soak', 'control', 'interaction'].includes(stage))
					for (const id of auditedPages)
						if (!expected[fw]?.includes(id)) {
							audited.findings.push('independent registry missing audited page ' + id)
							audited.status = 'failed'
						}
				const command = manifest.commands.find((c) =>
					c.outputs.some((o) => o.file === path.basename(file)),
				)
				if (!command || command.exitCode !== 0) {
					audited.findings.push('missing/successless command provenance')
					audited.status = 'failed'
				}
				if (command && !Number.isFinite(Date.parse(command.started))) {
					audited.findings.push('invalid command start date')
					audited.status = 'failed'
				}
				if (command && stage !== 'ssr') {
					if (!Number.isFinite(Date.parse(result.date))) {
						audited.findings.push('invalid raw result date')
						audited.status = 'failed'
					} else if (new Date(result.date) < new Date(command.started)) {
						audited.findings.push('raw result predates command')
						audited.status = 'failed'
					}
				}
				if (result.framework && result.framework !== fw) {
					audited.findings.push('wrong framework')
					audited.status = 'failed'
				}
				const output = command?.outputs.find((o) => o.file === path.basename(file))
				if (
					output?.sha256 &&
					crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !==
						output.sha256
				) {
					audited.findings.push('raw checksum differs from archived output')
					audited.status = 'failed'
				}
				const log = command && path.join(directory, `${command.name}.txt`)
				if (log && fs.existsSync(log)) {
					const diagnostics = fs
						.readFileSync(log, 'utf8')
						.split('\n')
						.filter((line) =>
							/(?:TypeError|ReferenceError|RangeError|SyntaxError|Unhandled\w*|pageerror)\b|\bError:|ошибка|console\.error/.test(
								line,
							),
						)
					if (diagnostics.length) {
						audited.findings.push(
							`command diagnostics: ${[...new Set(diagnostics)].slice(0, 5).join(' | ')}`,
						)
						audited.status = 'failed'
					}
				}
				cells[`${stage}/${fw}`] = audited
			} catch (error) {
				cells[`${stage}/${fw}`] = {
					status: error.code === 'ENOENT' ? 'not-run' : 'failed',
					findings: [
						error.code === 'ENOENT'
							? 'Missing raw result'
							: `Invalid raw JSON/schema: ${error.message}`,
					],
				}
			}
		}
	return {
		schemaVersion: 1,
		run: manifest.id,
		generated: new Date().toISOString(),
		cells,
		valid: Object.values(cells).every((c) => ['measured', 'not-applicable'].includes(c.status)),
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const result = auditRun(path.resolve(process.argv[2]))
	fs.writeFileSync(path.join(process.argv[2], 'summary.json'), JSON.stringify(result) + '\n')
	console.log(
		JSON.stringify(
			Object.fromEntries(
				Object.entries(result.cells).map(([key, value]) => [
					key,
					{ status: value.status, findings: value.findings },
				]),
			),
		),
	)
	if (!result.valid) process.exitCode = 1
}
