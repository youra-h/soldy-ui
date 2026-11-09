import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { classifyCell, groupCauses } from './classification.mjs'
import { components, prompt } from './protocol.mjs'
import { acceptObservation, checkCohort, checkExecution } from './integrity.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const directory = path.join(root, 'benchmarks/ai')
fs.mkdirSync(path.join(directory, 'prompts'), { recursive: true })
const hashes = {}
for (const component of components) {
	const text = prompt(component)
	const file = path.join(directory, 'prompts', `${component}.txt`)
	if (fs.existsSync(file) && !fs.readFileSync(file).equals(Buffer.from(text)))
		throw new Error(`Refusing to overwrite the frozen ${component} prompt`)
	if (!fs.existsSync(file)) fs.writeFileSync(file, text)
	const hash = crypto.createHash('sha256').update(text).digest('hex')
	hashes[component] = hash
}
const baselinePath = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null
const inputsPath = process.argv[3] && path.resolve(process.argv[3])
const runsPath = process.argv[4] && path.resolve(process.argv[4])
const baseline =
	baselinePath && fs.existsSync(baselinePath)
		? JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
		: null
const link = (file) => path.relative(directory, path.resolve(file)).replaceAll('\\', '/')
const datasetFile = inputsPath && path.join(inputsPath, 'dataset.json')
const dataset =
	datasetFile && fs.existsSync(datasetFile)
		? JSON.parse(fs.readFileSync(datasetFile, 'utf8'))
		: null
const readExecution = (folder) => {
	for (const name of ['execution.json', 'ci-execution.json']) {
		const file = path.join(folder, name)
		if (fs.existsSync(file)) {
			const value = JSON.parse(fs.readFileSync(file))
			if (!Array.isArray(value)) return { value, file }
		}
	}
	return { value: null, file: null }
}
const baselineExecution = baseline ? readExecution(path.dirname(path.resolve(baselinePath))) : null
const baselineCompletion = baseline ? checkExecution(baselineExecution.value, baseline) : null
const cohortRecords = baseline
	? [{ name: 'Soxa', result: baseline, execution: baselineExecution.value }]
	: []
const participants = ['model-1', 'model-2'].map((slot, index) => {
	const entries = components.map((component) => {
		const input = inputsPath && path.join(inputsPath, `${index + 1}-${component}`)
		const manifestPath = input && path.join(input, 'manifest.json')
		const metadata =
			manifestPath && fs.existsSync(manifestPath)
				? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
				: null
		const output = runsPath && path.join(runsPath, `${index + 1}-${component}/results.json`)
		const observed =
			output && fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : null
		const execution = observed ? readExecution(path.dirname(output)) : null
		if (observed)
			cohortRecords.push({
				name: `${slot}/${component}`,
				result: observed,
				execution: execution.value,
			})
		const source = input && path.join(input, 'Candidate.vue')
		const sourceHash =
			source && fs.existsSync(source)
				? crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')
				: null
		const accepted = acceptObservation({
			component,
			metadata,
			observed,
			sourceHash,
			promptHash: hashes[component],
			execution: execution?.value,
		})
		return {
			component,
			status: accepted.status,
			observedStatus: observed?.status ?? null,
			inputStatus: metadata?.status ?? 'missing',
			requestedModel: metadata?.requestedModel ?? null,
			effectiveCliModel: metadata?.effectiveCliModel ?? null,
			actualModel: metadata?.actualModel ?? null,
			prompt: `prompts/${component}.txt`,
			promptHash: hashes[component],
			source: sourceHash ? link(source) : null,
			generationManifest: metadata ? link(manifestPath) : null,
			run: observed ? link(output) : null,
			execution: execution?.file ? link(execution.file) : null,
			completion: accepted.completion,
			results: accepted.results,
			diagnostic: observed?.error ?? observed?.reason ?? null,
			reason: accepted.invalid
				? 'Unverified/mismatched generation source, component or prompt'
				: accepted.completion?.status === 'incomplete'
					? accepted.completion.findings.join('; ')
					: !metadata
						? 'No isolated first response input'
						: !observed
							? 'Input recorded; validation not run'
							: null,
		}
	})
	const actualModels = [...new Set(entries.map((entry) => entry.actualModel).filter(Boolean))]
	const cliModels = [
		...new Set(
			entries.map((entry) => entry.effectiveCliModel ?? entry.requestedModel).filter(Boolean),
		),
	]
	return {
		slot,
		actualModel: actualModels.length === 1 ? actualModels[0] : null,
		returnedModelIds: actualModels,
		selectedCliModels: cliModels,
		displayLabel:
			actualModels.length === 1
				? actualModels[0]
				: cliModels.length === 1
					? `${cliModels[0]} (CLI selection; provider ID not exposed)`
					: slot,
		status: entries.every((entry) => entry.inputStatus === 'missing')
			? 'blocked-input'
			: entries.every((entry) => entry.run && entry.status !== 'incomplete-execution')
				? 'completed-observations'
				: 'incomplete',
		components: entries,
	}
})
const comparisonValidity = checkCohort(cohortRecords)
const invalidInputs = participants.flatMap((participant) =>
	participant.components
		.filter((entry) => entry.status === 'invalid-input')
		.map((entry) => `${participant.slot}/${entry.component}: invalid generation input`),
)
if (invalidInputs.length) {
	comparisonValidity.status = 'invalid'
	comparisonValidity.findings.push(...invalidInputs)
}
if (comparisonValidity.status === 'invalid')
	for (const participant of participants) {
		participant.status = 'invalid-comparison'
		for (const entry of participant.components) {
			entry.results = []
			if (entry.status !== 'invalid-input') {
				entry.status = 'invalid-cohort'
				entry.reason = 'Comparison provenance mismatch; see comparisonValidity'
			}
		}
	}
const result = {
	schemaVersion: 2,
	date: new Date().toISOString(),
	scope: 'Vue only; no cross-framework AI conclusions',
	comparisonValidity,
	generation: {
		route: dataset?.route ?? null,
		cliVersion: dataset?.cliVersion ?? null,
		configuredModels: dataset?.models ?? [],
		outputBudget: dataset?.outputBudget ?? null,
		protocol: dataset ? link(datasetFile) : null,
		integrity:
			inputsPath && fs.existsSync(path.join(inputsPath, 'integrity.json'))
				? link(path.join(inputsPath, 'integrity.json'))
				: null,
		note: dataset?.route?.startsWith('codex-cli')
			? 'CLI-selected model IDs are recorded; actual provider model/snapshot not exposed. Generic tools declared, no execution observed. No equivalence to tool-free direct Responses API.'
			: 'Direct Responses and CLI are distinct generation routes',
	},
	baseline: {
		participant: 'soxa',
		commit: baseline?.commit ?? null,
		plannedCommit: '71bcbaa01bf3ea83050168b833cb56d023ca38ec',
		consumption: 'Repository source; future public site consumes published packages separately',
		status:
			comparisonValidity.status === 'invalid'
				? 'invalid-cohort'
				: baselineCompletion?.status === 'incomplete'
					? 'incomplete-execution'
					: (baseline?.status ?? 'not-run'),
		observedStatus: baseline?.status ?? null,
		execution: baselineExecution?.file ? link(baselineExecution.file) : null,
		completion: baselineCompletion,
		source: baselinePath
			? path.relative(directory, path.resolve(baselinePath)).replaceAll('\\', '/')
			: null,
		results:
			comparisonValidity.status === 'invalid' || baselineCompletion?.status === 'incomplete'
				? []
				: (baseline?.cells ?? []),
	},
	participants,
	methodology: {
		protocol: 'README.md',
		generator: '../../tools/bench-ai/generate.mjs',
		runner: '../../tools/bench-ai/run.mjs',
		automatedCoverage: [
			'axe initial/open/after',
			'APG subset in scenarios.mjs',
			'RTL functional behavior',
			'360px/touch in Chromium and WebKit',
			'IME composition in Chromium',
			'production SSR/hydration console guard',
			'10000 logical records/options',
			'DatePicker PageUp/PageDown month navigation',
			'Editable Select typed-prefix activation',
			'Historical duration-only reduced-motion observations (superseded criterion)',
		],
		limitedCoverage: {
			reducedMotion:
				'Historical observations recorded durations only; properties cannot be recovered; not a motion verdict',
			datePicker:
				'Day/month keyboard navigation; year-specific shortcut outside this protocol',
			select: 'Editable search/multiple mode; noneditable typeahead is not applicable to the generated target',
		},
		screenReader: {
			status: 'not-run',
			manualProtocol: 'manual-screen-reader.md',
			reason: 'ariaSnapshot and axe do not demonstrate real spoken announcements',
		},
	},
	website: {
		status: 'not-run',
		reason: 'Data handoff now; public SSG page and translations remain in the original task; deployment separate',
	},
}
result.interpretation = {
	historicalProtocol: 'protocol.v1.json',
	correctedMethodology: {
		status: 'not-retroactively-executed',
		motion: 'Active changed keyframe properties; geometry is movement, appearance separate, unknown incomplete',
		axe: 'WCAG and best practice separate; region integration needs live DOM landmark context',
		targetedEvidence: 'targeted/2026-11-09-windows-chromium.json',
	},
	categoriesAreNotBugCounts: true,
	behavior: 'Assertions and cause groups only; no overall ranking from cells',
	accessibility:
		'WCAG and best practice findings retain rule IDs and raw contexts; manual screen readers not run',
	speedAndMemory:
		'../validation/report.md; only common historical cohorts support comparisons. This AI protocol does not measure latency or retained memory.',
	workload:
		'AI large: 10000 rows x 2 data columns with SSR/hydration/audit; performance Table: 5000 x 20. Different workloads.',
	groups: groupCauses([
		...result.baseline.results.flatMap((cell) =>
			classifyCell(cell, { participant: 'Soxa', raw: result.baseline.source }),
		),
		...participants.flatMap((p) =>
			p.components.flatMap((entry) =>
				entry.results.flatMap((cell) =>
					classifyCell(cell, { participant: p.displayLabel, raw: entry.run }),
				),
			),
		),
	]),
}
const exportFile = path.join(directory, 'results.v2.json')
fs.writeFileSync(exportFile, JSON.stringify(result, null, '  ') + '\n')

if (baseline || inputsPath) {
	const compact = (cells) => {
		if (!cells.length) return 'not-run'
		return ['passed', 'failed', 'not-run', 'not-applicable']
			.map((status) => {
				const n = cells.filter((cell) => cell.status === status).length
				return n ? `${status}: ${n}` : null
			})
			.filter(Boolean)
			.join(', ')
	}
	const rows = components.map(
		(component) =>
			`| ${component} | ${result.baseline.status === 'invalid-cohort' ? 'invalid-cohort' : result.baseline.results.length ? compact(result.baseline.results.filter((cell) => cell.component === component)) : result.baseline.status} | ${participants
				.map((participant) => {
					const entry = participant.components.find(
						(entry) => entry.component === component,
					)
					return ['invalid-input', 'invalid-cohort'].includes(entry.status)
						? entry.status
						: entry.results.length
							? compact(entry.results)
							: entry.status
				})
				.join(' | ')} |`,
	)
	const failures = [
		...(baseline &&
		['compile-failed', 'runtime-failed', 'runner-failed'].includes(baseline.status)
			? [
					{
						participant: 'Soxa',
						engine: 'infrastructure',
						component: 'baseline',
						mode: baseline.status,
						failure: baseline.error ?? baseline.reason,
						raw: result.baseline.source,
					},
				]
			: []),
		...result.baseline.results
			.filter((cell) => cell.status === 'failed')
			.map((cell) => ({ participant: 'Soxa', raw: result.baseline.source, ...cell })),
		...participants.flatMap((participant) =>
			participant.components
				.filter((entry) =>
					[
						'compile-failed',
						'runtime-failed',
						'protocol-violation',
						'invalid-input',
						'runner-failed',
					].includes(entry.status),
				)
				.map((entry) => ({
					participant: participant.displayLabel,
					engine: 'source',
					component: entry.component,
					mode: entry.status,
					failure: entry.reason ?? entry.diagnostic,
					raw: entry.run ?? entry.generationManifest,
				})),
		),
		...participants.flatMap((participant) =>
			participant.components.flatMap((entry) =>
				entry.results
					.filter((cell) => cell.status === 'failed')
					.map((cell) => ({
						participant: participant.actualModel ?? participant.slot,
						raw: entry.run,
						...cell,
					})),
			),
		),
	]
	const validationPending =
		!baseline && participants.every((p) => p.components.every((entry) => !entry.run))
	const causeRows = result.interpretation.groups.map(
		(group) =>
			'- ' +
			group.participant +
			' / ' +
			group.category +
			' / ' +
			group.cause +
			': ' +
			group.observations.length +
			' observations' +
			(group.task ? ' (' + group.task + ')' : ''),
	)
	const text = [
		'# Cause interpretation (v2)',
		'',
		'Historical cells below retain their original status; they are not independent bugs or a ranking. Corrected methodology does not retroactively turn failed cells into passed.',
		'',
		...causeRows,
		'',
		'Behavior, accessibility, speed and memory are separate dimensions. Speed/memory evidence: [common historical validation cohorts](../validation/report.md). New Soxa observations are platform-specific and separate. AI large is 10000 x 2 plus SSR/audit; performance Table is 5000 x 20.',
		'',
		'# AI и Soxa: результаты проверки Vue',
		'',
		participants.every((p) => p.status === 'blocked-input')
			? '**Сравнение с AI пока не выполнено:** изолированные первые ответы двух моделей отсутствуют. Собственный baseline ниже не доказывает преимущество над отсутствующим участником.'
			: validationPending
				? '**Реальные ответы получены; одинаковая проверка ещё не запущена.** Вывод о преимуществе участника до validation делать нельзя.'
				: 'Результаты ограничены этими первыми ответами, Vue и перечисленными сценариями. Неудачи сохранены наравне с успехами; общий вывод о любых AI компонентах из этой выборки не следует.',
		'',
		'[Протокол и ограничения](README.md), [версионированные данные](results.v2.json), [performance/memory отчёт](../validation/report.md).',
		'',
		dataset
			? `Генерация: ${dataset.route ?? 'direct Responses'}, ${dataset.cliVersion ?? 'CLI не используется'}. Exact prompts и неизменённые исходники — в [dataset](${link(datasetFile)}). Provider model/snapshot в CLI не раскрыт, configured model ID указан явно. CLI budget 12000 запрошен в prompt; hard cap не подтверждён. Generic tools объявлены, выполнения не наблюдалось. Это отдельный Codex first-response experiment.`
			: 'Входная матрица генерации ещё не заполнена.',
		'',
		`| Компонент | Soxa | ${participants.map((p) => p.displayLabel).join(' | ')} |`,
		'| --- | --- | --- | --- |',
		...rows,
		'',
		'`passed` означает прохождение выполненных автоматических assertions, а не полную доступность. Записи `axe.incomplete` в raw требуют ручной проверки: отсутствие violations при incomplete не подтверждает прохождение соответствующего правила.',
		'',
		'**Failed observations:**',
		'',
		...(failures.length
			? failures.map((cell) => {
					const headline = String(cell.failure ?? 'See raw diagnostic').split(/\r?\n/)[0]
					return `- ${cell.participant} / ${cell.engine} / ${cell.component} / ${cell.mode}: ${headline}${cell.raw ? ` ([raw](${cell.raw}))` : ''}`
				})
			: [
					'Нет записанных failed cells. Отсутствующие inputs/движки и непройденные ручные проверки остаются not-run.',
				]),
		'',
		'Compile/runtime/invalid-input статусы смотрите в JSON рядом с точными исходниками и generation manifests; они не заменяются passed cells. Source baseline — commit библиотеки из экспорта и отдельный source hash SFC, будущий сайт потребляет опубликованные пакеты.',
		'',
		'Ручные NVDA/VoiceOver: **not-run**. Accessibility tree и axe не подтверждают слышимые объявления. [Ручной протокол](manual-screen-reader.md). Reduced-motion выводы относятся только к наблюдаемым состояниям; годовые сочетания DatePicker и noneditable Select вне этого протокола.',
		'Порог reduced-motion 100 ms — критерий протокола, включая color/focus-border transitions. Его превышение само по себе не доказывает WCAG motion violation или вестибулярную проблему.',
		'',
		'Публичная SSG страница, переводы и опубликованный baseline остаются объёмом исходной задачи для дальнейшего этапа сайта. Деплой выполняется по отдельному запросу.',
		'',
	].join('\n')
	const integrityNotice =
		comparisonValidity.status === 'invalid'
			? `**Сравнение сред невалидно.** Проверенные клетки исключены из сводки; исходные run files сохранены для диагностики. ${comparisonValidity.findings.join('; ')}.`
			: comparisonValidity.status === 'incomplete'
				? `**Автоматическая матрица неполная.** ${comparisonValidity.incomplete.join('; ')}. Это отдельный статус от качества компонентов.`
				: '**Целостность происхождения данных: valid.** Все 11 записей имеют общие commit, library state, OS, runtime/lock/harness hashes и согласованные наблюдённые версии браузеров. Это не означает отсутствие компонентных ошибок или прохождение ручных проверок.'
	fs.writeFileSync(
		path.join(directory, 'report.v2.md'),
		text.replace('\n\n[Протокол', `\n\n${integrityNotice}\n\n[Протокол`),
	)
}
