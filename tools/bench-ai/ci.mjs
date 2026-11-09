import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { components } from './protocol.mjs'
import { checkExecution } from './integrity.mjs'

/** Completeness gate for research output, separate from component acceptance. */
const inputs = process.argv[2]
const directory = inputs ? 'benchmarks/ai/runs/ci-models' : 'benchmarks/ai/runs/ci-soxa'
const args = inputs
	? ['tools/bench-ai/batch.mjs', inputs, directory]
	: ['tools/bench-ai/run.mjs', 'soxa', directory]
const child = spawnSync(process.execPath, args, {
	stdio: 'inherit',
	...(inputs ? {} : { timeout: 10 * 60000, killSignal: 'SIGTERM' }),
})
const execution = {
	originalExitCode: child.status,
	signal: child.signal,
	error: child.error?.code ?? null,
}
if (!fs.existsSync(directory))
	throw new Error('Research runner did not create its output directory')
fs.writeFileSync(
	path.join(directory, 'ci-execution.json'),
	JSON.stringify(execution, null, '\t') + '\n',
)
const subjects = inputs
	? [1, 2].flatMap((slot) =>
			components.map((component) => ({
				name: `${slot}-${component}`,
				folder: path.join(directory, `${slot}-${component}`),
				components: [component],
			})),
		)
	: [{ name: 'Soxa', folder: directory, components }]
const observations = []
const completeness = []
for (const subject of subjects) {
	const file = path.join(subject.folder, 'results.json')
	if (!fs.existsSync(file)) {
		completeness.push(`${subject.name}: missing result`)
		continue
	}
	const result = JSON.parse(fs.readFileSync(file))
	const processFile = path.join(subject.folder, 'execution.json')
	const processResult = inputs
		? fs.existsSync(processFile)
			? JSON.parse(fs.readFileSync(processFile))
			: null
		: execution
	const completion = checkExecution(processResult, result)
	if (completion.status !== 'complete') {
		completeness.push(...completion.findings.map((finding) => `${subject.name}: ${finding}`))
		continue
	}
	if (
		inputs &&
		['compile-failed', 'runtime-failed', 'protocol-violation'].includes(result.status)
	) {
		observations.push(
			`**${subject.name}: ${result.status}** — ${result.error ?? result.reason}`,
		)
		continue
	}
	if (!['tested-with-failures', 'tested-with-gaps'].includes(result.status)) {
		completeness.push(`${subject.name}: runner did not complete (${result.status})`)
		continue
	}
	for (const engine of ['chromium', 'webkit'])
		for (const component of subject.components) {
			for (const mode of [
				'default',
				'rtl',
				'narrow-touch',
				'reduce',
				...(component === 'select' ? ['ime'] : []),
				...(['select', 'table'].includes(component) ? ['large'] : []),
			]) {
				const cell = result.cells.find(
					(cell) =>
						cell.engine === engine &&
						cell.component === component &&
						cell.mode === mode,
				)
				const expectedSkip = engine === 'webkit' && mode === 'ime'
				if (
					!cell ||
					!(expectedSkip
						? cell.status === 'not-applicable'
						: ['passed', 'failed'].includes(cell.status))
				)
					completeness.push(
						`${subject.name}/${engine}/${component}/${mode}: missing observation`,
					)
				if (cell?.status === 'failed')
					observations.push(
						`**${subject.name}/${engine}/${component}/${mode}**: ${cell.failure}`,
					)
			}
		}
}
const summary = [
	'## Исследовательские наблюдения: это не приёмка компонентов',
	'',
	`Исходный exit runner: ${child.status}. Failed component observations: **${observations.length}**. Ошибки полноты/инструмента: **${completeness.length}**. Job проверяет инструмент и полноту экспорта; компонентные ошибки остаются failed в артефакте.`,
	'',
	...observations.map((text) => `- ${text}`),
	...completeness.map((text) => `- **INCOMPLETE** ${text}`),
	'',
	'Ручные screen reader объявления не проверены. Генерация моделей в CI не выполняется; используются только сохранённые первые ответы.',
].join('\n')
console.log(summary)
if (process.env.GITHUB_STEP_SUMMARY)
	fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n')
if (completeness.length || child.error) process.exitCode = 1
