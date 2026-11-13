import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '../../../..'),
	run = path.join(root, 'benchmarks/validation/runs/audit-new-components-20261113')
const read = (f) => JSON.parse(fs.readFileSync(path.join(run, f), 'utf8'))
const summary = read('summary.json')
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
	'alert-dialog',
]
const axe = {
	alert: 1,
	badge: 7,
	breadcrumbs: 4,
	separator: 4,
	'toggle-button': 4,
	'toggle-group': 4,
	'code-block': 4,
	avatar: 4,
	'alert-dialog': 2,
	'avatar-group': 1,
}
const actions = {
	alert: ['dismiss'],
	breadcrumbs: ['open', 'close'],
	'toggle-button': ['press', 'release'],
	'toggle-group': ['choose first', 'clear first'],
	'code-block': ['snippet two', 'copy', 'snippet one'],
	'alert-dialog': ['open', 'close', 'cancel', 'confirm'],
}
const fmt = (n) => (Number.isFinite(n) ? n.toFixed(2) : 'N/A')
const stat = (s) =>
	s ? fmt(s.median) + ' [' + fmt(s.min) + '–' + fmt(s.max) + ']; N=' + s.n : 'N/A'
const matrix = targets.flatMap((component) =>
	hosts.map((host) => {
		const direct = read('soak-' + host + '.json').transitions.filter(
			(t) => t?.page === component,
		)
		return {
			component,
			host,
			functional: component === 'breadcrumbs' && host === 'solid' ? 'FAIL focus' : 'PASS',
			axe: axe[component],
			pages: summary.cells['pages/' + host].metrics[component],
			soak: {
				complete: direct.filter((t) => !t.skipped && !t.stopped).length,
				direct: direct.length,
			},
			interaction: actions[component] ?? null,
			memory:
				component === 'avatar' && host === 'webc'
					? 'SIGNAL native Chromium img/UA retention'
					: 'no growth detected',
			parity: 'pending',
		}
	}),
)
fs.writeFileSync(
	path.join(run, 'matrix.json'),
	JSON.stringify({
		schemaVersion: 1,
		generated: new Date().toISOString(),
		state: 'draft: recovery/isolated Chromium/parity/final CI pending',
		sourceCommit: 'e0c94a76c402a8c425c197768397384fd5a4c5af',
		supplementCommit: '62ee161f34db66c79771bcea4c8edfd97ecdbbd4',
		rows: matrix,
		auxiliary: hosts.map((host) => ({
			component: 'avatar-group',
			host,
			pages: summary.cells['pages/' + host].metrics['avatar-group'],
		})),
	}) + '\n',
)
const lines = [
	'# Аудит девяти компонентов — 13 ноября 2026',
	'',
	'**Черновик: Angular recovery выполняется; изолированный Chromium, parity и итоговая remote CI ещё ожидаются. Это не заключение о готовности стабильного выпуска.**',
	'',
	'[Задача 1an4hvw5vua](https://app.clickup.com/t/1an4hvw5vua), [PR #861](https://github.com/youra-h/soxa-ui/pull/861). Scope: Alert, Badge, Breadcrumbs, Separator, ToggleButton, ToggleGroup, CodeBlock, Avatar, AlertDialog ×6 адаптеров; Avatar.Group отдельно.',
	'',
	'Подтверждён [Solid Breadcrumbs focus defect](https://app.clickup.com/t/1an4hvw5wur): overflow закрывается по Escape, но фокус оказывается на BODY вместо текущего trigger. Обычный test остаётся FAIL, исправление продукта вынесено отдельно по указанию владельца. Публичное API и библиотечные реализации этим PR не меняются.',
	'',
	'## Источники и метод',
	'',
	'Исходный полный measured workload заморожен на e0c94a76c402a8c425c197768397384fd5a4c5af: `npm run bench:validate -- audit-new-components-20261113 pages,soak,control,interaction`, 09:06:06Z–10:55:57Z. [Manifest](runs/audit-new-components-20261113/manifest.json) содержит source/build hashes, версии и точные команды. [Strict summary](runs/audit-new-components-20261113/summary.json) сохраняет исходный FAIL pages/angular, 23/24 измеренных ячеек. Exit0 процесса не подменяет проверку raw errors и полноты.',
	'',
	'Пять адаптеров выполнили все44 component pages +all/empty/leak +3tours. Angular измерил42страницы, включая все10 целевых, затем остановился на неподдерживаемом harness prop direction у DragAndDrop. Отдельный полный Angular recovery62ee161f34db66c79771bcea4c8edfd97ecdbbd4 не перезаписывает исходный raw и пока выполняется.',
	'',
	'Recovery пишет direction только целевым handle, проверяет Separator и убирает игнорируемый CodeBlock code рядом со snippets. Обычные целевые действия/содержимое snippets сохранены, но это другая harness версия. Исходные CodeBlock measurements включали предупреждение о лишнем code. [Frozen preflight](runs/audit-new-components-20261113-preflight-final/page-update-preflight.json):47страниц/служебных сценариев ×6 mount→update→unmount PASS, 0errors/warnings.',
	'',
	'Pages n50/act10/warm2/cycles20/rounds3/settle6000ms; шесть браузеров параллельно. Soak: все6 одновременно,30минут после warmup, seed7/every50/settle6000ms. Control: все6 одновременно,1min/every5/planted leak. Interaction: адаптеры последовательно, rates1/4/6, warm2/reps10; counting N1/50/count-reps3. Сборки/functional tests не пересекались с исходными measured stages. Angular recovery параллелен только отдельно отмеченным memory diagnostics: его timings контекстные, межадаптерного ранжирования нет.',
	'',
	'Mount/update/unmount включают второй RAF: это задержка до установившегося кадра, не чистый CPU. Вес — mounted−before JS heap; счётчики не равны памяти процесса. Чётная медиана усредняет два центральных значения. Сопоставимого historical baseline этих9 нет; отсутствие regressions не заявляется.',
	'',
	'## Матрица 54 сочетаний',
	'',
	'C/W — полный functional Chromium/WebKit e0c; дополнительные24cases62ee ожидают финального полного прогона. Axe — реально выполненные состояния на каждом engine. Soak complete/direct — только прямые переходы без skip/stop, all отдельно. Статика: keyboard N/A с семантическими проверками.',
	'',
	'| Компонент | Host | Functional C/W | Axe C/W | Memory | Soak complete/direct | Interaction | Manual | Parity |',
	'| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
	...matrix.map(
		(r) =>
			'| ' +
			[
				r.component,
				r.host,
				r.functional,
				r.axe + '/' + r.axe,
				r.memory,
				r.soak.complete + '/' + r.soak.direct,
				r.interaction ? r.interaction.length + ' actions ×3×10' : 'N/A static',
				r.functional === 'FAIL focus'
					? 'FAIL focus'
					: r.interaction
						? 'PASS'
						: 'semantics PASS; keyboard N/A',
				'pending',
			].join(' | ') +
			' |',
	),
	'',
	'Avatar.Group дополнительно:6 адаптеров,1axe state/engine/host,20memorycycles; existing Avatar suite проверяет overflow/раскладку/forced colors. Keyboard N/A для статической группы.',
	'',
	'## Вес и lifecycle timings',
	'',
	'Исходный e0c, включая завершённые Angular target cycles до сбоя нецелевого DragAndDrop. Каждый timing median[min–max], N20; KiB/копию=median(weight)/50/1024. No-growth означает отсутствие сигнала при данных порогах, не доказательство отсутствия любого удержания.',
	'',
	'| Компонент | Host | Mount ms | Update ms | Unmount ms | KiB/copy | Heap B/cycle | Δnodes/core/emitters/listeners | Actions/cycle |',
	'| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
	...[...targets, 'avatar-group'].flatMap((c) =>
		hosts.map((f) => {
			const p = summary.cells['pages/' + f].metrics[c]
			return (
				'| ' +
				[
					c,
					f,
					stat(p.mountMs),
					stat(p.updateMs),
					stat(p.unmountMs),
					fmt(p.weightBytes.median / 50 / 1024),
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
	),
	'',
	'## Soak и положительный контроль',
	'',
	'Все6 сессий30+min, errors0/отсутствующих transitions0. Floor — минимумы последних/первых3 samples; transient last sample не равен leak. Planted leak обнаружен всеми6.',
	'',
	'| Host | Soak min | Transitions | Floor Δnodes/core/emitters/listeners | Heap B/transition | Control min/transitions |',
	'| --- | --- | --- | --- | --- | --- |',
	...hosts.map((f) => {
		const s = summary.cells['soak/' + f].metrics.session,
			c = summary.cells['control/' + f].metrics.session
		return (
			'| ' +
			[
				f,
				fmt(s.minutes),
				s.transitions,
				[s.growth.nodes, s.growth.components, s.growth.emitters, s.growth.listeners].join(
					'/',
				),
				fmt(s.heapBytesPerTransition),
				fmt(c.minutes) + '/' + c.transitions,
			].join(' | ') +
			' |'
		)
	}),
	'',
	'Pages signal: counter growth>=10 за20cycles или heap slope>max(4096B/cycle,3×abs(empty slope)). Soak signal: positive floor counter или heap slope>4096B/transition. Все исходные delta сохранены. Strict validator21/21tests PASS, включая отсутствие target одновременно из compiled registry и raw, empty/planted leak controls, finite samples и resumed stages.',
	'',
	'## Avatar: native image signal',
	'',
	'Webc Avatar: +6000DOM за20cycles, core/emitters/listeners0; Webc soak floor +9780DOM. [Matched controls](runs/audit-new-components-20261113-supplement/avatar-controls.json) повторили+6000 для exact scenario, native/Webc SVG/PNG и ожидания actual complete; manual variants loaded50/50.',
	'',
	'[Pure control](runs/audit-new-components-20261113-supplement/native-image-isolation.json): fresh browser/about:blank без app browser imports,4SVG/PNG/wait variants, +6000DOM/+38092Bheap/0listeners, core/emitters N/A; scripts0/benchfalse/final document3elements. Это исключает library/polyfill imports как необходимое условие сигнала.',
	'',
	'[Strong retainer paths](runs/audit-new-components-20261113-supplement/image-retainers.json): actual Webc и pure native img→HTMLImageElement::ViewportChangeListener→MediaQueryMatcher→HTMLDocument→GC roots. UA alttext img удерживается через ShadowRoot img. +1000 исходных img, UA img, ShadowRoot, двух span и Text объясняют+6000. XMLDocument/SVG roots delta0. Native signal остаётся SIGNAL в матрице; library memory PASS не объявляется.',
	'',
	'Gzip before/end heaps фактического churn сохранены с SHA256; распаковать в .heapsnapshot для DevTools. Bounded traversal различает gc-root/no-recorded-strong-parent/bounded; выборка не равна полному доказательству для всего графа. Seed7 replay115–115 и stock N→2N heap выполнены отдельно; разбор чисел будет добавлен. Stock fallback mount не заменяет post-churn heap.',
	'',
	'## Interaction и изоляция',
	'',
	'14target actions ×3rates ×10reps ×6=2520timed samples; counting14×2sizes×3×6=504. Neighbor DOM writes max0. CodeBlock copy измеряет активацию; clipboard outcome доказан отдельными exact-copy/denial functional tests, не click count. INP — Event Timing sample стенда, не полевой показатель сайта.',
	'',
	'| Host | Component/action | Paint ×1/×4/×6 ms | Settled ×6 ms | INP ×6 ms | Update N1/N50 | Tick N1/N50 | Neighbor writes max |',
	'| --- | --- | --- | --- | --- | --- | --- | --- |',
	...hosts.flatMap((f) =>
		Object.entries(actions).flatMap(([c, as]) =>
			as.map((a) => {
				const m = summary.cells['interaction/' + f].metrics,
					t = (r) => m[c + '/' + r + '/' + a],
					one = m['count/' + c + '/1/' + a],
					many = m['count/' + c + '/50/' + a]
				return (
					'| ' +
					[
						f,
						c + '/' + a,
						[1, 4, 6].map((r) => fmt(t(r).paintMs.median)).join('/'),
						stat(t(6).settledMs),
						stat(t(6).inpMs),
						fmt(one.renders?.update?.median) + '/' + fmt(many.renders?.update?.median),
						fmt(one.renders?.tick?.median) + '/' + fmt(many.renders?.tick?.median),
						Math.max(one.writes.others.max, many.writes.others.max),
					].join(' | ') +
					' |'
				)
			}),
		),
	),
	'',
	'Все rate min/max/N, mount/update/tick counters и имена рендерившихся компонентов — в strict summary и interaction-<host>.json. Accounting адаптеров разный; числа не равны универсальному CPU.',
	'',
	'## Functional, axe, manual и CI',
	'',
	'Чистая remoteCI e0c: Chromium4384PASS/1FAIL; WebKit4287PASS/1FAIL/97inherited capability skips. Единственный FAIL — Solidfocus. Axe828/828 reports/engine,210target cases/engine, unresolved0/stale0, axe4.14.0; Chromium156.0.8078.4/WebKit27.2. Первоначальные6CodeBlock axe setup failures, CSS writer гонка и precommit6readiness smoke failures сохранены как harness attempts, не скрыты.',
	'',
	'Новый focused suite96:95PASS/1SolidFAIL.6отдельных restore cases после2RAF и live aria-controls проверяют Enter/click по actual menu и aria-expanded; исходный focus case остаётся fresh mount. ToggleButton обе direction; ToggleGroup single/multiple×orientation×direction/Home/End/disabled; AlertDialog safe focus/trap/backdrop/choice/nested и6live locale updates. Shared scenario suite150/150 all-six PASS. Existing suites покрывают остальные статические/кликабельные состояния, exact clipboard success/denial/removal, Avatar loaded/error/gradient/forced colors.',
	'',
	'Axe incomplete не равен violation/PASS. [Target findings](runs/audit-new-components-20261113/a11y-target-review.json) сохраняют420raw pointers. Новых target waivers и unresolved serious/critical нет. Full-registry inherited Toasts contrast exception869fpjgvg отдельно сохранена, вне9компонентов. Обновление dispositions финальными данными ожидается.',
	'',
	'CodeBlock real gutter contrast all6×2: oren7.558072756, fg oklch(0.446 0.03 256.802)/white; dark5.044798946, fg oklch(0.66 0.02 264.5)/bg oklch(0.255 0.02 264.5), root/gutter opacity1. [12numeric diagnostics](runs/audit-new-components-20261113-supplement/chromium-contrast.txt) получены existing contrast helper; aria-hidden не был принят доказательством visual contrast. Avatar gradients имеют исполненные all-six computed contrast>=4.5/forced-colors tests; Breadcrumb region moderate portal уже описан в ACCESSIBILITY, ID refs проверены вручную; modal background incomplete сопоставлен с native focus trap.',
	'',
	'[Manual keyboard](runs/audit-new-components-20261113/manual-keyboard-all-hosts.json):35/36interactive PASS,1SolidfocusFAIL;18static semantics PASS/keyboard N/A. Все6Breadcrumb closed/open aria-controls разрешаются. Electron43.8.6/Chromium150 — дополнительное наблюдение. NVDA/VoiceOver/live speech недоступны, не проверялись; AT conformance не заявляется.',
	'',
	'[Remote e0c CI](https://github.com/youra-h/soxa-ui/actions/runs/43400080161):30PASS/2browserFAIL только knownfocus. [Provenance/logs](runs/audit-new-components-20261113/remote-ci.json) различает head e0c и synthetic checkout c315ee8788ffc058fc027b481cad862fdd20d47e. Build/types/packages/install/min-peers/lint/English/changeset PASS. Новый CI62ee выполняется.',
	'',
	'Финальный isolated Chromium, полный Angular recovery, fresh parity6и final CI ещё ожидаются. Known focus блокирует stable-readiness claim. Product fix/release/merge в аудит не включались.',
	'',
]
fs.writeFileSync(
	path.join(root, 'benchmarks/validation/new-components-2026-11-13.md'),
	lines.join('\n'),
	'utf8',
)
console.log(
	JSON.stringify({
		matrixRows: matrix.length,
		auxiliary: hosts.length,
		reportLines: lines.length,
	}),
)
