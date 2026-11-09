<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ruRU } from '@soxa-ui/plugins'
import { PREVIEW_PROPS } from '@soxa-ui/playground-shared'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import host from '../hosts/vue'
import {
	CASES,
	PROTOCOL_VERSION,
	STORAGE_KEY,
	answerKey,
	emptyAnswer,
	emptyEnvironment,
	makeReport,
	restoreDraft,
} from './protocol'

const storageWarning = ref('')
let initial = { environment: emptyEnvironment(), answers: {}, activeCase: CASES[0].id }
let startedAt = new Date().toISOString()

try {
	const saved = localStorage.getItem(STORAGE_KEY)

	initial = restoreDraft(saved)

	if (saved) {
		const date = JSON.parse(saved).startedAt

		if (typeof date === 'string' && Number.isFinite(Date.parse(date))) startedAt = date
	}
} catch {
	storageWarning.value =
		'Не удалось восстановить черновик. Ответы можно заполнить и скачать; автосохранение может быть недоступно.'
}

const environment = reactive(initial.environment)
const answers = reactive<Record<string, ReturnType<typeof emptyAnswer>>>(initial.answers)

const requestedCase = new URLSearchParams(location.search).get('case')
const activeCase = ref(
	CASES.some((test) => test.id === requestedCase)
		? (requestedCase ?? initial.activeCase)
		: initial.activeCase,
)

for (const test of CASES)
	for (const step of test.steps) answers[answerKey(test.id, step.id)] ??= emptyAnswer()

const current = computed(() => CASES.find((test) => test.id === activeCase.value) ?? CASES[0])
const source = {
	...__MANUAL_A11Y_SOURCE__,
	libraryVersion: __SOXA_VERSION__,
	adapter: 'vue',
	locale: 'ru-RU',
	theme: 'oren',
	page: location.href,
	userAgent: navigator.userAgent,
}

const report = computed(() => makeReport(environment, answers, source, startedAt))
const completed = computed(
	() => report.value.tests.flatMap((test) => test.steps).length - report.value.counts['not-run'],
)
const total = CASES.reduce((sum, test) => sum + test.steps.length, 0)

const fixture = ref<HTMLElement | null>(null)
const start = ref<HTMLButtonElement | null>(null)
const heading = ref<HTMLElement | null>(null)
const fixtureError = ref('')
const exportNotice = ref('')
const referenceChecked = ref(false)
let mounted: IPreviewHandle | undefined

function mountFixture() {
	mounted?.unmount()
	mounted = undefined
	fixtureError.value = ''

	if (!fixture.value) return

	try {
		host.setLocale(ruRU)
		mounted = host.mount(fixture.value, {
			component: current.value.component,
			props: { ...PREVIEW_PROPS[current.value.component], ...current.value.props },
		})
	} catch (error) {
		fixtureError.value = error instanceof Error ? error.message : String(error)
	}
}

async function selectCase(id: string) {
	activeCase.value = id
	await nextTick()

	heading.value?.focus()
}
async function resetFixture() {
	mountFixture()
	await nextTick()

	start.value?.focus()
}

function countOf(id: string) {
	const test = CASES.find((item) => item.id === id)

	return (
		test?.steps.filter((step) => answers[answerKey(id, step.id)].outcome !== 'not-run')
			.length ?? 0
	)
}

function persist() {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				protocolVersion: PROTOCOL_VERSION,
				startedAt,
				environment,
				answers,
				activeCase: activeCase.value,
			}),
		)

		storageWarning.value = ''
	} catch {
		storageWarning.value =
			'Браузер не сохраняет черновик. Не закрывайте вкладку до скачивания отчёта.'
	}
}

watch([environment, answers, activeCase], persist, { deep: true })
watch(activeCase, mountFixture, { flush: 'post' })
onMounted(mountFixture)
onBeforeUnmount(() => mounted?.unmount())

function download() {
	const data = makeReport(environment, answers, source, startedAt)
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json;charset=utf-8',
	})

	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')

	link.href = url
	link.download = `soxa-accessibility-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

	document.body.append(link)
	link.click()
	link.remove()

	setTimeout(() => URL.revokeObjectURL(url), 30_000)
	exportNotice.value =
		data.completion === 'partial'
			? 'Отчёт скачан. Он помечен как частичный: незаполненные шаги сохранены как «Не проверял». Пришлите JSON в чат.'
			: 'Отчёт скачан. Пришлите JSON в чат для проверки. Ответы остаются в браузере.'
}
</script>

<template>
	<a class="skip" href="#test-heading">Перейти к текущему тесту</a>
	<header class="page-header">
		<p class="eyebrow">SOXA · РУЧНАЯ ПРОВЕРКА</p>
		<h1>Проверим то, что слышно</h1>
		<p>
			Один пример, несколько действий и ваши наблюдения. Всего {{ CASES.length }} тестов,
			{{ total }} шагов. Можно прерваться и продолжить.
		</p>
		<p class="scope">
			<strong>Протокол {{ PROTOCOL_VERSION }} · повтор Toasts после отчёта 17:21</strong>
		</p>
		<p class="scope">Vue · русская локаль · тема oren · версия {{ source.libraryVersion }}</p>
	</header>
	<main>
		<details class="panel instructions" open>
			<summary>Как проходить проверку</summary>
			<ol>
				<li>
					Заполните окружение ниже. Запустите только один скринридер: например, «Экранный
					диктор» Windows.
				</li>
				<li>
					Выберите тест. Прочитайте действия и ожидаемый смысл заранее. Нажмите «К началу
					примера», затем Tab — фокус войдёт в настоящий компонент Soxa.
				</li>
				<li>
					Выполняйте действия с паузами. Проверяйте и речь, и доступность действий.
					Записывайте услышанное, даже если оно отличается от ожидаемого.
				</li>
				<li>
					После закрытия панели или выхода из компонента заполните результат каждого шага.
					«Неясно» подходит, если мешает режим диктора или непонятна команда.
				</li>
				<li>
					В конце нажмите «Готово — скачать результат». Пришлите скачанный JSON в наш чат.
					Можно выгрузить и частичный результат.
				</li>
			</ol>
			<p>
				Windows: Win + Ctrl + Enter включает и выключает диктор; Ctrl прерывает речь. Его
				режим сканирования переключается клавишами диктора + Space. В роли клавиши диктора
				обычно Caps Lock или Insert. Если стрелки читают страницу вместо управления полем,
				запишите режим и попробуйте переключиться. Это наблюдение, а не автоматический
				провал компонента.
			</p>
			<p>
				Формулировки диктора могут отличаться: важны смысл, доступность управления и
				сохранение контекста. Ничего не отмечается пройденным автоматически.
			</p>
			<p>
				<strong>Повторная проверка, протокол 4.</strong> Для Select и Menu выключите
				сканирование: Caps Lock + Space (или Insert + Space), пока не услышите «Сканирование
				выключено». Для чтения ячеек Table используются команды диктора: Ctrl + Alt +
				стрелки. В Table сначала включите сканирование и найдите таблицу клавишей T. Сайт не
				может определить режим автоматически — запишите его в замечаниях.
			</p>
			<p>
				<a
					href="https://support.microsoft.com/ru-ru/accessibility/windows/narrator/appendix-b-narrator-keyboard-commands-and-touch-gestures"
					target="_blank"
					rel="noopener noreferrer"
					>Команды Windows Narrator (руководство Microsoft, новая вкладка)</a
				>
			</p>
			<p>
				Select и Menu прошли в протоколе 3. Сейчас проверяем только избыточную речь Toasts.
				Три прежних отчёта сохранены отдельно. Ответы старого протокола не подставляются как
				уже пройденные проверки.
			</p>
		</details>

		<div class="audit-body">
			<section class="panel" aria-labelledby="environment-heading">
				<h2 id="environment-heading">Окружение</h2>
				<p>
					Пройдите один отчёт в одной связке ОС, браузера и диктора. Для другой связки
					используйте отдельный профиль браузера или приватное окно.
				</p>
				<div class="environment">
					<label
						>Проверяющий (можно псевдоним)<input
							form="audit-export"
							v-model="environment.examiner"
							required
							autocomplete="off"
					/></label>
					<label
						>Windows / другая ОС и версия<input
							form="audit-export"
							v-model="environment.os"
							required
							placeholder="Например: Windows 11, 24H2"
					/></label>
					<label
						>Браузер и версия<input
							form="audit-export"
							v-model="environment.browser"
							required
							placeholder="Например: Chrome 142…"
					/></label>
					<label
						>Скринридер<input form="audit-export" v-model="environment.reader" required
					/></label>
					<label
						>Версия диктора / сборка Windows<input
							form="audit-export"
							v-model="environment.readerVersion"
							placeholder="Если неизвестна — напишите «не знаю»"
					/></label>
					<label
						>Язык речи<input
							form="audit-export"
							v-model="environment.speechLanguage"
							required
					/></label>
				</div>
				<p>
					Версию Windows можно посмотреть через Win + R → winver, браузера — в его разделе
					«О браузере». Эти сведения и введённые ответы войдут в файл. Автоматически
					добавятся дата, версия библиотеки и строка браузера; отправки на сервер нет.
				</p>
			</section>

			<div class="workspace">
				<nav class="panel test-nav" aria-label="Тесты компонентов">
					<p class="progress">Отмечено {{ completed }} из {{ total }} шагов</p>
					<ol>
						<li v-for="test in CASES" :key="test.id">
							<button
								type="button"
								:aria-current="test.id === activeCase ? 'step' : undefined"
								@click="selectCase(test.id)"
							>
								{{ test.title }}
								<span>{{ countOf(test.id) }}/{{ test.steps.length }}</span>
							</button>
						</li>
					</ol>
					<p class="muted">
						Черновик сохраняется в этом браузере. Не очищайте данные сайта до выгрузки.
					</p>
				</nav>

				<section class="panel test-panel" aria-labelledby="test-heading">
					<h2 id="test-heading" ref="heading" tabindex="-1">{{ current.title }}</h2>
					<p>{{ current.hint }}</p>
					<div class="fixture-toolbar">
						<button type="button" @click="start?.focus()">К началу примера</button>
						<button type="button" @click="resetFixture">Начать пример заново</button>
					</div>
					<p class="muted">
						Повторный запуск сбрасывает только пример. Ваши записи сохраняются.
					</p>
					<section class="fixture" aria-label="Пример для проверки">
						<button ref="start" type="button" class="boundary">
							Начало примера — нажмите Tab
						</button>
						<div ref="fixture" class="fixture-mount"></div>
						<button type="button" class="boundary">Конец примера</button>
					</section>
					<p v-if="fixtureError" role="alert">
						Пример не загрузился: {{ fixtureError }}. Отметьте шаги как «Неясно» и
						скопируйте ошибку в замечания.
					</p>

					<details v-if="current.id === 'menu'" class="panel">
						<summary>Сравнение флажков Narrator — без Soxa</summary>
						<p>
							Если «Сетка» или «Линейка» звучат как «не определено», выключите
							сканирование и проверьте два эталона ниже. На каждом нажмите Space
							дважды. Запишите в замечаниях шага 2 три строки: Soxa / обычный флажок /
							эталон ARIA — и точные фразы для включённого и выключенного состояния.
						</p>
						<label><input type="checkbox" /> Обычный флажок HTML</label>
						<div role="menu" aria-label="Эталон ARIA без Soxa">
							<button
								type="button"
								role="menuitemcheckbox"
								:aria-checked="referenceChecked"
								@click="referenceChecked = !referenceChecked"
							>
								Эталонный пункт ARIA
							</button>
						</div>
						<p>
							Состояние эталона: {{ referenceChecked ? 'отмечен' : 'не отмечен' }}.
							Это диагностика сочетания браузера и диктора, а не проверка библиотеки.
						</p>
					</details>
					<fieldset
						v-for="(step, index) in current.steps"
						:key="answerKey(current.id, step.id)"
						class="step"
					>
						<legend>Шаг {{ index + 1 }}</legend>
						<p class="action">{{ step.action }}</p>
						<p><strong>Ожидаем:</strong> {{ step.expected }}</p>
						<label :for="`${current.id}-${step.id}-result`"
							>Результат шага {{ index + 1 }}</label
						>
						<select
							:id="`${current.id}-${step.id}-result`"
							v-model="answers[answerKey(current.id, step.id)].outcome"
						>
							<option value="not-run">Не проверял</option>
							<option value="passed">Получилось</option>
							<option value="failed">Есть проблема</option>
							<option value="unclear">Неясно / не удалось проверить</option>
						</select>
						<label :for="`${current.id}-${step.id}-speech`"
							>Что произнёс диктор — шаг {{ index + 1 }}</label
						>
						<textarea
							:id="`${current.id}-${step.id}-speech`"
							v-model="answers[answerKey(current.id, step.id)].speech"
							rows="2"
							placeholder="Дословно или своими словами; если молчал, так и напишите"
						></textarea>
						<label :for="`${current.id}-${step.id}-notes`"
							>Что произошло / замечания — шаг {{ index + 1 }}</label
						>
						<textarea
							:id="`${current.id}-${step.id}-notes`"
							v-model="answers[answerKey(current.id, step.id)].notes"
							rows="2"
							placeholder="Куда попал фокус, что не сработало, режим диктора"
						></textarea>
					</fieldset>
					<button
						v-if="CASES.findIndex((test) => test.id === activeCase) < CASES.length - 1"
						type="button"
						class="primary"
						@click="
							selectCase(
								CASES[CASES.findIndex((test) => test.id === activeCase) + 1].id,
							)
						"
					>
						Следующий тест
					</button>
				</section>
			</div>

			<form
				id="audit-export"
				class="panel finish"
				aria-labelledby="finish-heading"
				@submit.prevent="download"
			>
				<h2 id="finish-heading">Сохранить результат</h2>
				<p>
					Получилось: {{ report.counts.passed }} · Есть проблема:
					{{ report.counts.failed }} · Неясно: {{ report.counts.unclear }} · Не проверял:
					{{ report.counts['not-run'] }}
				</p>
				<p v-if="storageWarning" role="alert">{{ storageWarning }}</p>
				<button class="primary" type="submit">Готово — скачать результат</button>
				<p role="status">{{ exportNotice }}</p>
				<p class="muted">
					Файл содержит все 36 шагов, включая непроверенные. Его скачивание не
					подтверждает доступность библиотеки — это ваши наблюдения для разбора.
				</p>
			</form>
		</div>
	</main>
</template>
