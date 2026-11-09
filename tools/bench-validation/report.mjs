import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditRun, frameworks } from './audit.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const directory = path.resolve(process.argv[2])
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'))
const summary = auditRun(directory)
fs.writeFileSync(path.join(directory, 'summary.json'), JSON.stringify(summary) + '\n')
const relative = path
	.relative(path.join(root, 'benchmarks/validation'), directory)
	.replaceAll('\\', '/')
const num = (n, scale = 1, decimals = 2) =>
	typeof n === 'number' && Number.isFinite(n)
		? (n / scale).toFixed(decimals).replace('.', ',')
		: '—'
const spread = (s, scale = 1) =>
	s?.n ? `${num(s.median, scale)} (${num(s.min, scale)}–${num(s.max, scale)}; N=${s.n})` : '—'
const status = (stage, fw) => summary.cells[`${stage}/${fw}`]?.status ?? 'not-run'
const metrics = (stage, fw) => summary.cells[`${stage}/${fw}`]?.metrics ?? {}
const verdict = (value) =>
	({
		'counter-growth': 'рост счётчиков: воспроизвести',
		'heap-growth': 'рост JS heap: причина не установлена',
		'no-growth-detected': 'рост не обнаружен',
		clean: 'рост не обнаружен',
		leak: 'рост живых объектов',
		'heap grows': 'рост JS heap',
	})[value] ?? '—'
const lines = []
const out = (text = '') => lines.push(text)
const aiFile = path.join(root, 'benchmarks/ai/results.v1.json')
const ai = fs.existsSync(aiFile) ? JSON.parse(fs.readFileSync(aiFile, 'utf8')) : null
const aiInputs =
	ai?.participants
		.flatMap((p) => p.components)
		.filter((entry) => entry.inputStatus === 'generated').length ?? 0
const aiRuns =
	ai?.participants.flatMap((p) => p.components).filter((entry) => entry.run).length ?? 0
const pageMeasured = frameworks.filter((fw) => status('pages', fw) === 'measured')
const componentMetrics = pageMeasured.flatMap((fw) =>
	Object.entries(metrics('pages', fw))
		.filter(([id]) => !['all', 'empty', 'leak', 'tour'].includes(id))
		.map(([id, metric]) => ({ fw, id, ...metric })),
)
const counterFindings = componentMetrics.filter((metric) => metric.verdict === 'counter-growth')
const heapFindings = componentMetrics.filter((metric) => metric.verdict === 'heap-growth')
out('# Soxa: память, жизненный цикл и отклик компонентов')
out()
out(
	`Собственные продуктовые сборки Soxa проверены в сценариях страниц, долгой сессии, действий, Table и SSR. Это результаты конкретного запуска **${manifest.id}**: ${Object.values(summary.cells).filter((cell) => cell.status === 'measured').length} измеренных ячеек, ${Object.values(summary.cells).filter((cell) => cell.status === 'failed').length} с ошибками, ${Object.values(summary.cells).filter((cell) => cell.status === 'not-run').length} без результата. Измерение с ошибками не считается успешной проверкой компонента. Отдельный AI эксперимент: ${aiInputs} реальных первых ответов и ${aiRuns} записанных прогонов; [точная матрица и ограничения](../ai/report.md).`,
)
out()
out(
	`В ${componentMetrics.length} полностью проверенных сочетаниях «component page × платформа» (${pageMeasured.length} платформ) ${counterFindings.length ? `обнаружен рост живых счётчиков в ${counterFindings.length} случаях; их нужно воспроизвести перед выводом о причине` : 'накопление живых счётчиков по критерию циклов не обнаружено'}. Отдельно рост JS heap выше порога: ${heapFindings.length} случаев. Положительный контроль с намеренным удержанием объектов проверяется отдельно и не относится к дефектам библиотеки.`,
)
out()
out(
	'| Платформа | Select: Δheap 50 копий, MiB | Select mount, мс | Table 5000: рендер до успокоения, мс | Table 5000: Δheap, MB | SSR all / статус данных |',
)
out('| --- | ---: | ---: | ---: | ---: | --- |')
for (const fw of frameworks) {
	const select = status('pages', fw) === 'measured' ? metrics('pages', fw).select : null
	const table = status('table', fw) === 'measured' ? metrics('table', fw) : {}
	const ssr = status('ssr', fw) === 'measured' ? metrics('ssr', fw).all : null
	out(
		`| ${fw} | ${spread(select?.weightBytes, 1048576)} | ${spread(select?.mountMs)} | ${spread(table['Рендер']?.settledMs)} | ${spread(table['Память, МБ'])} | ${verdict(ssr?.verdict)} / ${status('ssr', fw)} |`,
	)
}
out()
out(
	'Прирост JS heap после GC показывает управляемую кучу, которую видит V8. Он не включает всю память DOM, GPU, renderer/browser процессов или ОС и не равен полной памяти компонента. Рост кучи сам по себе не доказывает утечку. Формулировка «рост не обнаружен» ограничена перечисленными сценариями, длительностью и счётчиками.',
)
out()
out(
	`Исходные повторения и ошибки: [raw и manifest](${relative}/manifest.json), [машинная сводка](${relative}/summary.json). [Методика и воспроизведение](README.md). Исторические данные чужих библиотек приведены [отдельно](historical.md); они не образуют рейтинг с новым запуском.`,
)
out()
out('## Покрытие')
out()
out(
	'| Платформа | Страницы и обход | 30 минут | Контроль утечки | Действия | Table 5000×20 | Virtual 10000×20 | SSR |',
)
out('| --- | --- | --- | --- | --- | --- | --- | --- |')
for (const fw of frameworks)
	out(
		`| ${fw} | ${['pages', 'soak', 'control', 'interaction', 'table', 'virtual', 'ssr'].map((stage) => status(stage, fw)).join(' | ')} |`,
	)
out()
out(
	'`measured` означает наличие полного проверенного набора данных; это отдельная ось от результата `counter-growth`, `heap-growth` и ошибок функциональности. `failed` сохраняет снятые числа для диагностики, но не даёт положительного вывода. Web Components SSR — `not-applicable`, у платформы нет этого рендерера.',
)
out()
out('## Страницы: цена 50 копий и монтирование')
out()
out(
	'Двадцать измеряемых циклов после двух разогревочных, действия на 10 копиях, пауза перед осевшими замерами 6 с; полный обход всех страниц — три круга. Таблица показывает медиану и min–max всех 20 измерений. «На копию» — разность heap mounted−before, делённая на 50; у `all` это набор разных компонентов, не 50 копий.',
)
out(
	'Диагностический сигнал циклов: осевший прирост хотя бы одного живого счётчика ≥10 объектов; для heap — наклон выше max(4 KiB/цикл, утроенный модуль наклона empty). Меньшие дельты не доказывают отсутствие удержания: они тоже сохранены в raw.',
)
out(
	'Framework, библиотечные определения, иконки и общие кэши уже загружены до этого прироста. Число на копию не включает весь общий runtime приложения, native CSS/DOM memory или размер JS/CSS файлов загрузки.',
)
out()
out(
	'| Платформа / страница (статус данных) | JS heap 50 копий, MiB | На копию, KiB | Монтирование, мс | Рост heap, KiB/цикл | Наблюдение |',
)
out('| --- | ---: | ---: | ---: | ---: | --- |')
for (const fw of frameworks)
	for (const id of ['select', 'date-picker', 'dialog', 'tabs', 'table', 'all', 'empty', 'leak']) {
		const m = metrics('pages', fw)[id]
		if (m)
			out(
				`| ${fw} / ${id} (${status('pages', fw)}) | ${spread(m.weightBytes, 1048576)} | ${['all', 'empty'].includes(id) ? '—' : num(m.weightBytes.median, 50 * 1024)} | ${spread(m.mountMs)} | ${num(m.heapBytesPerCycle, 1024)} | ${id === 'leak' ? 'подставная утечка (контроль)' : verdict(m.verdict)} |`,
			)
	}
out()
out('### Полный обход: конец каждого круга')
out()
out(
	'Это мгновенные показатели после последней страницы круга, без дополнительного settle. Оставшийся таймер Toasts может временно удерживать снятое; один рост между обходами не получает verdict утечки.',
)
out()
out('| Платформа / круг | Heap, MiB | Компоненты / шины / DOM / listeners |')
out('| --- | ---: | --- |')
for (const fw of frameworks)
	for (const [index, point] of (metrics('pages', fw).tour?.endpoints ?? []).entries())
		out(
			`| ${fw} / ${index + 1} | ${num(point.heap, 1048576)} | ${['components', 'emitters', 'nodes', 'listeners'].map((key) => point[key]).join(' / ')} |`,
		)
out()
out(
	'Полный набор component pages, показатели DOM/listeners/core instances и все три обхода сохранены в raw; выборка пяти компонентов в этой таблице не сужает замер. Положительный прирост живых счётчиков — находка для воспроизведения, а не повод объявлять библиотеку безусловно неисправной.',
)
out()
out('## Долгая сессия: 30 минут, seed 7')
out()
out(
	'Шесть браузеров работают одновременно: это намеренная общая нагрузочная сессия памяти по исходной методике. Её длительности и частоты переходов нельзя использовать для сравнения быстродействия платформ. Каждый осевший замер — после паузы 6 с и GC. Контроль `leak` запускается отдельно на одну минуту, замер каждые пять переходов.',
)
out(
	'Рост счётчиков ниже — разность минимума последних и первых K точек (K до трёх), как в исходной soak методике: это нижняя граница после колебаний, а не буквальная разность первой и последней точки.',
)
out()
out(
	'| Платформа | Минуты / переходы / точки | Heap начало → конец, MiB | KiB/переход | Рост нижних границ: компоненты / шины / DOM / listeners | Наблюдение |',
)
out('| --- | --- | ---: | ---: | --- | --- |')
for (const fw of frameworks) {
	const m = metrics('soak', fw).session
	if (m)
		out(
			`| ${fw} (${status('soak', fw)}) | ${num(m.minutes)} / ${m.transitions} / ${m.points} | ${num(m.heapStart, 1048576)} → ${num(m.heapEnd, 1048576)} | ${num(m.heapBytesPerTransition, 1024)} | ${['components', 'emitters', 'nodes', 'listeners'].map((key) => m.growth[key]).join(' / ')} | ${verdict(m.verdict)} |`,
		)
}
out()
out('## Отклик: действие → кадр / успокоение')
out()
out(
	'Настоящий ввод Playwright в странице из 50 копий, CPU ×1/×4/×6; N=10 после двух разогревочных повторов. Ниже медиана (min–max) времени до кадра и до успокоения — трёх подряд кадров с интервалом меньше 50 мс. Это разные метрики. Все действия/rates и доступные Event Timing INP samples — в машинной сводке. Отсутствующее INP — `null`, не нулевой отклик. Locale actions измеряются от вызова, без input event. Отдельная counting build сравнивает работу 1 и 50 копий внутри каждого фреймворка; единицы разных фреймворков несопоставимы.',
)
out(
	'Поле `inp` исходного стенда — максимум Event Timing duration событий конкретного действия, а не итоговый web-vitals INP всей пользовательской сессии. N у него — число действий из десяти, для которых браузер зарегистрировал duration; это лабораторные данные, не полевая оценка сайта.',
)
out()
out(
	'| Платформа / действие | CPU | До кадра, мс | До успокоения, мс | Event Timing max duration (`inp`), мс |',
)
out('| --- | ---: | ---: | ---: | ---: |')
for (const fw of frameworks)
	for (const action of [
		'select/open',
		'select/type',
		'date-picker/open',
		'dialog/open',
		'tabs/tab 2',
	])
		for (const rate of [1, 4, 6]) {
			const [id, name] = action.split('/')
			const m = metrics('interaction', fw)[`${id}/${rate}/${name}`]
			if (m)
				out(
					`| ${fw} / ${action} (${status('interaction', fw)}) | ×${rate} | ${spread(m.paintMs)} | ${spread(m.settledMs)} | ${spread(m.inpMs)} |`,
				)
		}
out()
out('### Работа фреймворка: 1 и 50 копий')
out()
out(
	'N=3 измеряемых counting повторения. Единица update — собственная единица инструмента конкретного фреймворка, поэтому строки между платформами не ранжируются. Числа ниже показывают локальность действия внутри одной платформы.',
)
out()
out(
	'| Платформа / действие | Updates при 1 копии | Updates при 50 копиях | DOM writes в чужие копии |',
)
out('| --- | ---: | ---: | ---: |')
for (const fw of frameworks)
	for (const action of ['select/open', 'select/type', 'dialog/open', 'tabs/tab 2']) {
		const [id, name] = action.split('/')
		const one = metrics('interaction', fw)[`count/${id}/1/${name}`]
		const many = metrics('interaction', fw)[`count/${id}/50/${name}`]
		if (one && many)
			out(
				`| ${fw} / ${action} | ${spread(one.renders.update)} | ${spread(many.renders.update)} | ${spread(many.writes.others)} |`,
			)
	}
out()
out('## Table: 5000×20 и окно 10000×20')
out()
out(
	'Только Soxa, `fit=none+width=3248+track`, три свежие страницы на конфигурацию; virtual отдельно. Время в мс; память — десятичные MB исходного инструмента (округление 0,1 MB), не MiB раздела страниц. При виртуализации сценарий проходит прокруткой до конца, затем меняет данные и снимает таблицу. Остаток heap после одного снятия не доказывает повторяемую утечку.',
)
out()
out(
	'| Платформа / режим | Рендер до кадра / успокоения, мс | Heap после рендера, MB | Heap после прокрутки, MB | Heap после снятия и GC вне стека, MB |',
)
out('| --- | --- | ---: | ---: | ---: |')
for (const fw of frameworks)
	for (const stage of ['table', 'virtual']) {
		const m = metrics(stage, fw)
		out(
			`| ${fw} / ${stage} (${status(stage, fw)}) | ${spread(m['Рендер']?.paintMs)} / ${spread(m['Рендер']?.settledMs)} | ${spread(m['Память, МБ'])} | ${spread(m['Память после прокрутки, МБ'])} | ${spread(m['Память после, сборка вне стека, МБ'])} |`,
		)
	}
out()
out(
	'Выделение, снятие выделения, обе сортировки, замена данных и размонтирование с каждым исходным повтором — в raw и summary. Конфигурации с ошибкой или неполным числом повторов не включаются в выводы о производительности.',
)
out()
out('| Платформа / режим / действие | До кадра, мс | До успокоения, мс |')
out('| --- | ---: | ---: |')
for (const fw of frameworks)
	for (const stage of ['table', 'virtual'])
		for (const action of [
			'Выделить все',
			'Снять выделение',
			'Сортировка ↑',
			'Сортировка ↓',
			'Замена данных',
			'Размонтирование',
		]) {
			const m = metrics(stage, fw)[action]
			if (m)
				out(
					`| ${fw} / ${stage} / ${action} (${status(stage, fw)}) | ${spread(m.paintMs)} | ${spread(m.settledMs)} |`,
				)
		}
out()
out(
	'У исходного Virtual `scrollThrough` поля имеют отдельный смысл: `paint` — всё wall time прохода по экранам плюс финальное успокоение; `settled` — только финальное успокоение после прокрутки. Это не latency одного кадра. Методика сохранена, значения не переименованы в raw.',
)
out()
out(
	'| Virtual / платформа | Весь проход + финальное успокоение (`paint`), мс | Финальное успокоение (`settled`), мс |',
)
out('| --- | ---: | ---: |')
for (const fw of frameworks) {
	const m = metrics('virtual', fw)['Прокрутка до конца']
	if (m)
		out(`| ${fw} (${status('virtual', fw)}) | ${spread(m.paintMs)} | ${spread(m.settledMs)} |`)
}
out()
out('## SSR и изоляция соседних языков')
out()
out(
	'Пять платформ последовательно; внутри каждого процесса запросы ru/en/ar запускаются кругами. `empty`/`all`: 3000 рендеров, первые 600 разогрев; `leak`: 600/150; замер каждые 150, settle 3 с. Время — медиана средних интервалов между замерами после разогрева (N интервалов), а не p50 каждого запроса. Каждый markup сверяется с первым для его языка; отдельно проверяются язык узлов и направление даты. Подставной leak должен накапливать живые объекты.',
)
out()
out(
	'| Платформа | `all` heap, MiB | B/рендер | Δ компоненты / шины | Рендер, мс | Markup mismatch | Наблюдение / статус |',
)
out('| --- | ---: | ---: | --- | ---: | ---: | --- |')
for (const fw of frameworks.filter((fw) => fw !== 'webc')) {
	const m = metrics('ssr', fw).all
	out(
		`| ${fw} | ${num(m?.heapBytes, 1048576)} | ${num(m?.heap)} | ${m ? `${m.growth.components} / ${m.growth.emitters}` : '—'} | ${spread(m?.renderMs)} | ${m?.mismatches ?? '—'} | ${verdict(m?.verdict)} / ${status('ssr', fw)} |`,
	)
}
out()
out('## Ошибки и пределы выводов')
out()
for (const [name, cell] of Object.entries(summary.cells))
	if (cell.findings?.length) out(`- **${name} (${cell.status})**: ${cell.findings.join('; ')}.`)
out()
out(
	'Состояние AI сравнения, включая WebKit, приведено в отдельной матрице по ссылке выше. Реальные screen reader объявления и публичная страница сайта остаются отдельным объёмом исходной задачи. Accessibility tree и axe не подтверждают объявления NVDA/VoiceOver. Новые library/API/protected-layer изменения не включены в этот отчёт.',
)
out()
out('## Окружение и происхождение')
out()
out(
	`Дата начала: ${manifest.started}; окончание: ${manifest.finished ?? 'не зафиксировано'}. Commit: [${manifest.commit}](https://github.com/youra-h/soxa-ui/blob/${manifest.commit}/benchmarks/README.md). Исходники, dirty-state, lock hash, команды, время каждой команды, версии и hashes raw/build — в manifest и snapshots. Node ${manifest.node}; npm ${manifest.npm ?? 'версия не записана в первом этапе'}; Chromium ${manifest.browser}. ${manifest.os.platform} ${manifest.os.release}, ${manifest.os.arch}; CPU ${manifest.os.cpu}, ${manifest.os.cores} логических ядер; RAM ${num(manifest.os.totalMemory, 1073741824)} GiB.`,
)
out(
	'Это замеры на рабочей машине без аппаратной изоляции от фоновых процессов ОС. Вариативность времени показана диапазоном повторов; CPU throttling не превращает рабочую станцию в конкретную модель телефона. Перенос абсолютных значений на другой компьютер требует нового прогона.',
)
out()
out('| Исходный пакет Soxa | Версия manifest | Способ потребления |')
out('| --- | --- | --- |')
for (const [name, pkg] of Object.entries(manifest.libraryVersions ?? {}))
	out(`| ${name} | ${pkg.version} | Исходники репозитория |`)
out()
out(
	'Версия manifest вместе с commit описывает этот source run и сама по себе не доказывает тождество опубликованному npm tarball. Установка сайта из опубликованных пакетов проверяется отдельно.',
)
out()
out('| Runtime / инструмент первого этапа | Установленная версия |')
out('| --- | --- |')
for (const [name, version] of Object.entries(manifest.versions ?? {}))
	out(`| ${name} | ${version} |`)
out()
out(
	'Табличный стенд резолвит фреймворки из собственного окружения: его фактические runtime versions записаны у каждой Table/Virtual команды. Source/build/lock snapshots сохраняются отдельно для каждого следующего этапа; ранние страницы используют явно датированную late attestation, без заявления о предварительно снятых build hashes.',
)
fs.writeFileSync(path.join(root, 'benchmarks/validation/report.md'), lines.join('\n') + '\n')

if (process.argv.includes('--journals'))
	for (const fw of frameworks)
		for (const [stage, folder] of [
			['pages', 'pages'],
			['interaction', 'interaction'],
			['table', 'table'],
			['ssr', 'ssr'],
		]) {
			if (stage === 'ssr' && fw === 'webc') continue
			const file = path.join(root, `benchmarks/${folder}/${fw}.md`)
			const marker = `## 2026-11-09 — проверяемый запуск ${manifest.id}`
			if (!fs.readFileSync(file, 'utf8').includes(marker))
				fs.appendFileSync(
					file,
					`\n${marker}\n\nНовый собственный замер — [итоговый отчёт](../validation/report.md), [условия и команды](../validation/README.md), [manifest](../validation/${relative}/manifest.json), [raw ${stage}](../validation/${relative}/${stage}-${fw}.json), [машинная сводка](../validation/${relative}/summary.json). Статус данных: **${status(stage, fw)}**. Параметры и каждый повтор сохранены; исторические числа выше не переписаны.\n`,
				)
		}
