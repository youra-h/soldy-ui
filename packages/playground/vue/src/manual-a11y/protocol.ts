export const PROTOCOL_VERSION = 4

export type Outcome = 'not-run' | 'passed' | 'failed' | 'unclear'
export type Answer = { outcome: Outcome; speech: string; notes: string }
export type Environment = {
	examiner: string
	os: string
	browser: string
	reader: string
	readerVersion: string
	speechLanguage: string
}
export type Step = { id: string; action: string; expected: string }
export type TestCase = {
	id: string
	title: string
	component: string
	hint: string
	props: Record<string, unknown>
	steps: Step[]
}

const modalSteps: Step[] = [
	{
		id: 'open',
		action: 'Клавишей Tab перейдите к кнопке открытия примера. Нажмите Enter и дождитесь окончания речи.',
		expected:
			'Объявлены роль диалога и название «Настройки». Фокус переместился внутрь окна. Запишите первое объявление полностью.',
	},
	{
		id: 'forward',
		action: 'Нажмите Tab 6 раз с паузой после каждого нажатия. Запишите названия элементов по порядку.',
		expected:
			'Фокус проходит поле и кнопки окна, затем повторяет круг. На фон и поля результатов перейти нельзя.',
	},
	{
		id: 'backward',
		action: 'Нажмите Shift+Tab 6 раз. Попробуйте прочитать содержимое за пределами окна командами чтения вашего диктора.',
		expected:
			'Обратный обход остаётся внутри. При чтении доступно содержимое диалога; фон страницы скрыт от скринридера.',
	},
	{
		id: 'close',
		action: 'Нажмите Escape. Дождитесь закрытия. Нажмите Enter для повторного открытия, затем закройте кнопкой внутри окна.',
		expected:
			'Escape закрывает окно и возвращает фокус на кнопку открытия. Повторное открытие работает; кнопка закрытия имеет понятное имя.',
	},
]

export const CASES: TestCase[] = [
	{
		id: 'dialog',
		title: 'Dialog — модальное окно',
		component: 'dialog',
		hint: 'Кнопка «Открыть окно», заголовок «Настройки», поле «Имя», кнопки «Отмена» и «Сохранить».',
		props: {},
		steps: modalSteps,
	},
	{
		id: 'drawer',
		title: 'Drawer — выезжающая панель',
		component: 'drawer',
		hint: 'Кнопка «Открыть панель», заголовок «Фильтры», поле «Поиск», кнопки «Сбросить» и «Применить». Панель открывается у края экрана.',
		props: {},
		steps: modalSteps.map((step) => ({
			...step,
			expected: step.expected.replaceAll('Настройки', 'Фильтры'),
		})),
	},
	{
		id: 'select',
		title: 'Select — выбор одного значения',
		component: 'select',
		hint: 'Поле «Выбор варианта», варианты «Первый», «Второй», «Третий», «Четвёртый», «Пятый».',
		props: { aria_label: 'Выбор варианта', editable: false, mode: 'single' },
		steps: [
			{
				id: 'name',
				action: 'Отключите режим сканирования: Caps Lock + Space (или Insert + Space), до сообщения «Сканирование выключено». Клавишей Tab войдите в поле выбора. Дождитесь речи.',
				expected:
					'Понятны имя поля «Выбор варианта», его назначение и свёрнутое состояние.',
			},
			{
				id: 'options',
				action: 'Откройте список клавишей ArrowDown. Нажмите ArrowDown ещё два раза, затем Home и End. Делайте паузы.',
				expected:
					'Список открывается. Активный вариант озвучивается при перемещении. Home/End ведут к первому/последнему варианту.',
			},
			{
				id: 'choose',
				action: 'Нажмите Enter для выбора. Затем снова откройте список.',
				expected:
					'Выбранный вариант доступен по речи и отображается в поле. При повторном открытии состояние выбора понятно.',
			},
			{
				id: 'escape',
				action: 'Нажмите Escape, затем Tab.',
				expected:
					'Список закрывается, выбор сохраняется; Tab позволяет выйти из поля к следующему элементу страницы.',
			},
		],
	},
	{
		id: 'select-multiple',
		title: 'Select — поиск и несколько значений',
		component: 'select',
		hint: 'Редактируемое поле «Несколько вариантов». После выбора появляются теги с кнопками удаления.',
		props: { aria_label: 'Несколько вариантов', editable: true, mode: 'multiple' },
		steps: [
			{
				id: 'search',
				action: 'Отключите режим сканирования: Caps Lock + Space (или Insert + Space), до сообщения «Сканирование выключено». Войдите Tab в поле. Напечатайте «Перв». Стрелкой вниз перейдите к варианту и нажмите Enter.',
				expected:
					'Имя поля и найденный вариант понятны на слух; после Enter появляется выбранное значение «Первый».',
			},
			{
				id: 'second',
				action: 'Очистите текст поиска в самом поле. Напечатайте «Втор», перейдите к варианту стрелкой и нажмите Enter. Закройте список Escape, выйдите из поля и вернитесь Tab/Shift+Tab. Дождитесь описания поля.',
				expected:
					'Выбран «Второй», при этом «Первый» остаётся выбранным. При возвращении в поле его описание содержит «Первый, Второй». После отдельного выбора диктор может объявлять только изменённый вариант: запишите отдельно речь при выборе и при возврате в поле.',
			},
			{
				id: 'remove',
				action: 'Закройте список Escape. Найдите кнопку удаления первого выбранного тега клавишами Tab/Shift+Tab или командами чтения диктора и активируйте её.',
				expected:
					'Кнопка удаления имеет имя с названием значения. Удаляется только нужный тег; оставшийся выбор сохраняется.',
			},
			{
				id: 'leave',
				action: 'Повторно откройте список, пройдите несколько опций и закройте Escape. Выйдите Tab.',
				expected:
					'Озвучиваются активные опции и их состояние выбора. Нет ловушки фокуса и неожиданного сброса оставшегося выбора.',
			},
		],
	},
	{
		id: 'menu',
		title: 'Menu — меню и подменю',
		component: 'menu',
		hint: 'Кнопка «Действия». В меню есть «Сетка», «Линейка», сортировка, «Поделиться» с подменю и выключенный пункт «В архив».',
		props: { aria_label: 'Действия с записью' },
		steps: [
			{
				id: 'open',
				action: 'Отключите режим сканирования (Caps Lock + Space или Insert + Space, до сообщения «Сканирование выключено»). Перейдите Tab к кнопке «Действия», нажмите Enter. Пройдите пункты стрелками вниз/вверх.',
				expected:
					'Объявляется меню; названия и типы пунктов понятны, перемещение озвучивается.',
			},
			{
				id: 'checked',
				action: 'Найдите «Линейка», нажмите Space. При необходимости снова откройте меню. Проверьте состояние пункта. Затем выберите «По дате». Если флажки звучат как «не определено», раскройте сравнение под примером: проверьте обычный HTML-флажок и эталонный ARIA-пункт, запишите три результата в замечания.',
				expected:
					'Изменение отметки и выбранный вариант сортировки понятны на слух. Если меню закрылось, повторное открытие сохраняет состояние.',
			},
			{
				id: 'submenu',
				action: 'При выключенном сканировании найдите «Поделиться». В этом примере письмо слева направо: ArrowRight открывает подменю, ArrowLeft возвращает к «Поделиться». Пройдите несколько пунктов подменю и вернитесь.',
				expected:
					'Понятно наличие подменю; его пункты озвучиваются. Возврат приводит к «Поделиться», а не теряет фокус.',
			},
			{
				id: 'disabled',
				action: 'Найдите «В архив» и попробуйте активировать, если диктор позволяет перейти к нему. Затем закройте меню Escape.',
				expected:
					'Выключенный пункт недоступен для действия; его состояние объявляется, если он получает фокус. Escape возвращает к кнопке «Действия».',
			},
		],
	},
	{
		id: 'date-picker',
		title: 'DatePicker — дата и календарь',
		component: 'date-picker',
		hint: 'Поле «Дата поездки» с частями даты и кнопкой календаря. Локаль примеров — русская.',
		props: { aria_label: 'Дата поездки' },
		steps: [
			{
				id: 'segments',
				action: 'Перейдите Tab в поле даты. Стрелками влево/вправо пройдите части даты; попробуйте изменить одну часть стрелкой вверх.',
				expected:
					'Понятны название поля, текущая часть даты и её значение; изменение озвучивается.',
			},
			{
				id: 'open',
				action: 'Клавишей Tab найдите кнопку открытия календаря и нажмите Enter.',
				expected:
					'Кнопка имеет понятное имя. Календарь открывается; можно понять текущий месяц и день в фокусе.',
			},
			{
				id: 'days',
				action: 'На сетке календаря нажмите ArrowRight, ArrowDown, PageDown, PageUp с паузами.',
				expected:
					'При переходах понятны даты. При смене месяца контекст сохраняется; диктор не молчит на всех переходах.',
			},
			{
				id: 'select',
				action: 'Нажмите Enter на дне. Проверьте значение поля. Снова откройте календарь и закройте Escape.',
				expected:
					'Выбранная дата отображается и читается. Закрытие сохраняет значение; фокус остаётся в DatePicker или возвращается к его инициатору.',
			},
		],
	},
	{
		id: 'table',
		title: 'Table — таблица, сортировка, выбор',
		component: 'table',
		hint: 'Таблица «Сотрудники», заголовки колонок и выбор нескольких строк. Для чтения ячеек используйте команды таблицы вашего диктора; обычные стрелки не обязаны перемещать фокус по ячейкам.',
		props: { aria_label: 'Сотрудники', mode: 'multiple', resizable: false, reorderable: false },
		steps: [
			{
				id: 'read',
				action: 'Включите сканирование (Caps Lock + Space или Insert + Space, до сообщения «Сканирование включено»). Найдите таблицу клавишей T. Используйте Ctrl + Alt + ArrowRight/ArrowLeft для ячеек строки, Ctrl + Alt + ArrowDown/ArrowUp для строк. Прочитайте заголовки и две строки; Tab здесь только для кнопок и флажков.',
				expected:
					'Понятны имя таблицы, заголовки и значения. При перемещении между ячейками сохраняется контекст строки и колонки.',
			},
			{
				id: 'sort',
				action: 'Выключите сканирование для управления кнопкой. Клавишей Tab найдите кнопку сортировки и активируйте Enter дважды, дожидаясь речи. Запишите направление и язык объявления; ascending означает «по возрастанию», descending — «по убыванию».',
				expected:
					'Можно понять название колонки и направление после каждого изменения. Слова ascending/descending — стандартные состояния ARIA: язык их озвучивания зависит от диктора/браузера. Если направление остаётся непонятным, отметьте проблему и запишите фразу.',
			},
			{
				id: 'row',
				action: 'Найдите флажок выбора одной строки. Переключите его Space дважды.',
				expected:
					'Флажок имеет понятное имя, выбранное/невыбранное состояние объявляется. Можно понять, к какой строке он относится.',
			},
			{
				id: 'all',
				action: 'Найдите флажок выбора всех строк. Переключите его, проверьте строки, затем снимите общий выбор.',
				expected:
					'Назначение общего флажка и его состояние понятны; выбор строк согласован с общим выбором.',
			},
		],
	},
	{
		id: 'tabs',
		title: 'Tabs — вкладки и панели',
		component: 'tabs',
		hint: 'Вкладки «Первый» — «Пятый». Внутри каждой панели — текст с названием вкладки.',
		props: { aria_label: 'Разделы' },
		steps: [
			{
				id: 'enter',
				action: 'Клавишей Tab войдите в набор вкладок.',
				expected: 'Понятны роль вкладки, её название и выбранное состояние.',
			},
			{
				id: 'arrows',
				action: 'Нажмите ArrowRight дважды, затем ArrowLeft. Делайте паузы.',
				expected:
					'Озвучивается активная вкладка и её состояние; отображается соответствующая панель.',
			},
			{
				id: 'edges',
				action: 'Нажмите End, затем Home.',
				expected:
					'Фокус переходит к последней, затем первой вкладке; диктор сообщает правильные названия.',
			},
			{
				id: 'panel',
				action: 'Нажмите Tab и прочитайте активную панель командами чтения диктора.',
				expected:
					'Tab не обходит каждую неактивную вкладку подряд. Доступно содержимое активной панели; скрытые панели не читаются как активные.',
			},
		],
	},
	{
		id: 'toasts',
		title: 'Toasts — уведомления',
		component: 'toasts',
		hint: 'Несколько кнопок создают уведомления. Кнопка «загрузка → готово» меняет одно уведомление после завершения операции.',
		props: {},
		steps: [
			{
				id: 'announce',
				action: 'Перейдите Tab к кнопке «обычное». Нажмите Enter и дождитесь речи, не переводя фокус к самому уведомлению.',
				expected:
					'Текст нового уведомления озвучивается автоматически. Фокус остаётся на кнопке вызова.',
			},
			{
				id: 'error',
				action: 'Нажмите кнопку «error», чтобы вызвать уведомление «Нет сети». Запишите фактически услышанное.',
				expected:
					'Сообщение об ошибке доступно на слух. Интерфейс не уводит фокус без действия пользователя.',
			},
			{
				id: 'update',
				action: 'Выйдите из области уведомлений. Один раз кратко нажмите Enter на «загрузка → готово» и отпустите клавишу. Не трогайте клавиатуру до результата. Запишите, сколько раз услышали «Сохраняем» и «Сохранено», включая слова кнопки закрытия, если они звучат.',
				expected:
					'Автоматически озвучиваются только начало «Сохраняем» и итог «Сохранено» (в примере перед ними есть номер). Объявление не перечисляет список, группы или кнопку «Закрыть»; фокус остаётся на кнопке запуска.',
			},
			{
				id: 'close',
				action: 'Вызовите ещё одно уведомление. Найдите его кнопку закрытия командами чтения/Tab и активируйте. Если не успели, вызовите повторно.',
				expected:
					'Кнопка закрытия имеет понятное имя. После закрытия нет потери доступа к странице или ловушки фокуса.',
			},
		],
	},
]

export const emptyEnvironment = (): Environment => ({
	examiner: '',
	os: '',
	browser: '',
	reader: 'Windows Narrator — Экранный диктор',
	readerVersion: '',
	speechLanguage: 'Русский',
})
export const emptyAnswer = (): Answer => ({ outcome: 'not-run', speech: '', notes: '' })
export const answerKey = (caseId: string, stepId: string): string => `${caseId}/${stepId}`
export const STORAGE_KEY = 'soxa-manual-a11y-v4'

export function restoreDraft(text: string | null): {
	environment: Environment
	answers: Record<string, Answer>
	activeCase: string
} {
	const defaults = {
		environment: emptyEnvironment(),
		answers: {} as Record<string, Answer>,
		activeCase: CASES[0].id,
	}
	if (!text) return defaults
	const draft = JSON.parse(text)
	if (!draft || draft.protocolVersion !== PROTOCOL_VERSION)
		throw new Error('Несовместимый черновик')
	for (const key of Object.keys(defaults.environment) as (keyof Environment)[])
		if (typeof draft.environment?.[key] === 'string')
			defaults.environment[key] = draft.environment[key]
	for (const test of CASES)
		for (const step of test.steps) {
			const key = answerKey(test.id, step.id)
			const value = draft.answers?.[key]
			if (!value || !['not-run', 'passed', 'failed', 'unclear'].includes(value.outcome))
				continue
			defaults.answers[key] = {
				outcome: value.outcome,
				speech: typeof value.speech === 'string' ? value.speech : '',
				notes: typeof value.notes === 'string' ? value.notes : '',
			}
		}
	if (CASES.some((test) => test.id === draft.activeCase)) defaults.activeCase = draft.activeCase
	return defaults
}

export function makeReport(
	environment: Environment,
	answers: Record<string, Answer>,
	source: Record<string, string>,
	startedAt: string,
) {
	const tests = CASES.map((test) => ({
		id: test.id,
		component: test.component,
		title: test.title,
		props: test.props,
		steps: test.steps.map((step) => ({
			...step,
			...emptyAnswer(),
			...answers[answerKey(test.id, step.id)],
		})),
	}))
	const all = tests.flatMap((test) => test.steps)
	const counts = Object.fromEntries(
		(['not-run', 'passed', 'failed', 'unclear'] as const).map((outcome) => [
			outcome,
			all.filter((step) => step.outcome === outcome).length,
		]),
	)
	return {
		schemaVersion: 1,
		protocolVersion: PROTOCOL_VERSION,
		task: '869fn089k',
		startedAt,
		exportedAt: new Date().toISOString(),
		environment: { ...environment },
		source: { ...source },
		scope: 'Manual observations on the Vue adapter, Russian locale, oren theme; no claim for other adapters or screen readers.',
		completion: counts['not-run'] ? 'partial' : 'complete',
		verdict: counts.failed
			? 'findings'
			: counts.unclear || counts['not-run']
				? 'incomplete'
				: 'passed-by-examiner',
		counts,
		tests,
	}
}
