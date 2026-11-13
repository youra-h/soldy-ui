import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '../../../..')
const run = 'benchmarks/validation/runs/audit-new-components-20261113/'
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
const summary = read(run + 'summary.json')
const hosts = ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']
const targets = [
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
const actions = {
	alert: ['dismiss'],
	breadcrumbs: ['open', 'close'],
	'toggle-button': ['press', 'release'],
	'toggle-group': ['choose first', 'clear first'],
	'code-block': ['snippet two', 'copy', 'snippet one'],
	'alert-dialog': ['open', 'close', 'cancel', 'confirm'],
}
const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : 'N/A')
const heading = '## 2026-11-13 — аудит девяти новых компонентов'
const append = (file, lines) => {
	const absolute = path.join(root, file),
		old = fs.readFileSync(absolute, 'utf8')
	if (old.includes(heading)) throw new Error('Dated journal already exists: ' + file)
	fs.writeFileSync(absolute, old.trimEnd() + '\n\n' + lines.join('\n') + '\n', 'utf8')
}
const recovery = read(
	'benchmarks/validation/runs/audit-new-components-20261113-supplement/pages-angular-summary.json',
)
if (recovery.status !== 'measured' || recovery.findings.length)
	throw new Error('Angular recovery incomplete')
for (const host of hosts) {
	const metrics = summary.cells['pages/' + host].metrics
	const lines = [
		heading,
		'',
		'[Задача](https://app.clickup.com/t/1an4hvw5vua), [полный отчёт и матрица](../validation/new-components-2026-11-13.md). Исходные целевые циклы: e0c94a76c, Chromium 156.0.8078.4, n=50, act=10, warm=2, measured=20, settle=6000 ms. Mount/update/unmount включают второй RAF; это задержка до установившегося кадра, не чистое CPU. Сопоставимого исторического baseline этих девяти нет.',
		'',
		host === 'angular'
			? 'Исходный Angular raw завершил все целевые страницы, затем упал на нецелевом harness direction prop. Он сохранён как FAIL. Отдельный полный recovery на 62ee161f3 завершил весь реестр, all/empty/leak и три обхода; [raw и strict summary](../validation/runs/audit-new-components-20261113-supplement/pages-angular-summary.json). Recovery timings контекстные (один адаптер, часть времени параллельно memory diagnostics), здесь не подменяют исходные числа.'
			: 'Полный реестр из 44 страниц, all/empty/leak и три обхода завершены. Отрицательный empty и положительный planted leak контролируют метод.',
		'',
		'| Страница | KiB/копию | Mount ms | Update ms | Unmount ms | Heap B/цикл | Δnodes/core/emitters/JS listeners | Actions/цикл |',
		'| --- | --- | --- | --- | --- | --- | --- | --- |',
		...targets.map((id) => {
			const p = metrics[id]
			return (
				'| ' +
				[
					id,
					fmt(p.weightBytes.median / 50 / 1024),
					fmt(p.mountMs.median),
					fmt(p.updateMs.median),
					fmt(p.unmountMs.median),
					fmt(p.heapBytesPerCycle),
					[
						p.growth.nodes,
						p.growth.components,
						p.growth.emitters,
						p.growth.listeners,
					].join('/'),
					p.scenarioActions.median,
				].join(' | ') +
				' |'
			)
		}),
		'',
		host === 'webc'
			? 'Avatar сохраняет SIGNAL +6000 DOM; тот же native img/UA alttext путь воспроизводится на чистом about:blank без библиотеки. Core/emitters/JS listeners освобождаются; это не общий memory PASS. Actual post-churn heaps, pure controls, strong chains, seed7 replay и N→2N heap связаны в полном отчёте.'
			: 'У целевых страниц не обнаружено роста счётчиков при записанных порогах; это не доказательство отсутствия меньшего удержания.',
		'',
		'[Исходные cycles/base/end](../validation/runs/audit-new-components-20261113/pages-' +
			host +
			'.json), [min/max/N и независимая валидация](../validation/runs/audit-new-components-20261113/summary.json), [per-cell proof index](../validation/runs/audit-new-components-20261113/coverage-index.json).',
	]
	append('benchmarks/pages/' + host + '.md', lines)
	const m = summary.cells['interaction/' + host].metrics
	const response = [
		heading,
		'',
		'[Полный отчёт](../validation/new-components-2026-11-13.md). Source e0c94a76c; адаптеры измерены последовательно, n=50, rates=1/4/6, warm=2, reps=10; counting N=1/50, по 3 повтора. Медиана при чётном N — среднее двух центральных.',
		'',
		'| Действие | Paint ×1/×4/×6 ms | Settled ×6 ms | INP ×6 ms | Update N1/N50 | Tick N1/N50 | Neighbor DOM writes max |',
		'| --- | --- | --- | --- | --- | --- | --- |',
		...Object.entries(actions).flatMap(([id, list]) =>
			list.map((a) => {
				const one = m['count/' + id + '/1/' + a],
					many = m['count/' + id + '/50/' + a],
					six = m[id + '/6/' + a]
				return (
					'| ' +
					[
						id + '/' + a,
						[1, 4, 6]
							.map((rate) => fmt(m[id + '/' + rate + '/' + a].paintMs.median))
							.join('/'),
						fmt(six.settledMs.median),
						fmt(six.inpMs?.median),
						fmt(one.renders?.update?.median) + '/' + fmt(many.renders?.update?.median),
						fmt(one.renders?.tick?.median) + '/' + fmt(many.renders?.tick?.median),
						Math.max(one.writes.others.max, many.writes.others.max),
					].join(' | ') +
					' |'
				)
			}),
		),
		'',
		'Copy — время активации кнопки; успешность clipboard отдельно проверена exact-copy/denial browser tests. Статические Badge/Separator/Avatar не получают искусственного INP. Event Timing и render accounting имеют ограничения, указанные в полном отчёте; между адаптерами это разные механизмы, не универсальный CPU счётчик.',
		'',
		'[Все исходные repetitions и имена рендеров](../validation/runs/audit-new-components-20261113/interaction-' +
			host +
			'.json), [min/max/N](../validation/runs/audit-new-components-20261113/summary.json).',
	]
	append('benchmarks/interaction/' + host + '.md', response)
}
const parity = read(run + 'parity/parity-vue.json')
const report = fs.readFileSync(path.join(root, run + 'parity/parity-report.md'), 'utf8')
const table = report
	.split('\n')
	.filter((line) => /^\| (react|svelte|solid|webc|angular) \|/.test(line))
const count = Object.values(parity.pages).reduce((sum, p) => sum + p.steps.length, 0)
append('benchmarks/parity/report.md', [
	heading,
	'',
	'[Задача](https://app.clickup.com/t/1an4hvw5vua), [полный отчёт](../validation/new-components-2026-11-13.md), [неизменённый свежий normalized comparison](../validation/runs/audit-new-components-20261113/parity/parity-report.md). Проверено ' +
		Object.keys(parity.pages).length +
		' страниц, ' +
		count +
		' reference steps; все шесть raw journals сохранены. Сравниваются события/порядок, ARIA и focus после каждого шага. Новых blanket exceptions нет.',
	'',
	'| Framework | Steps differ | Pages |',
	'| --- | --- | --- |',
	...table,
	'',
	'Фактические различия и их классификация перечислены в полном отчёте; автоматическое parity не заменяет native keyboard focus checks и не делает известный Solid Breadcrumbs FAIL успешным.',
])
console.log('Appended 6 page journals, 6 interaction journals and parity journal')
