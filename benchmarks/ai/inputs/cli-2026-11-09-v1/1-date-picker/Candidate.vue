<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  locale: { type: String, default: 'en', validator: v => ['en', 'ru', 'ar'].includes(v) },
  dir: { type: String, default: 'ltr', validator: v => ['ltr', 'rtl'].includes(v) }
})

const translations = {
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    firstDay: 0,
    previous: 'Previous month',
    next: 'Next month',
    cancel: 'Cancel',
    empty: 'No date selected',
    help: 'Arrow keys move by day or week. Home and End move within the week. Page Up and Page Down change month; hold Shift to change year. Escape closes the calendar.'
  },
  ru: {
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    narrow: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    firstDay: 1,
    previous: 'Предыдущий месяц',
    next: 'Следующий месяц',
    cancel: 'Отмена',
    empty: 'Дата не выбрана',
    help: 'Стрелки перемещают по дням и неделям. Home и End — начало и конец недели. Page Up и Page Down меняют месяц, с Shift — год. Escape закрывает календарь.'
  },
  ar: {
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    weekdays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    narrow: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
    firstDay: 6,
    previous: 'الشهر السابق',
    next: 'الشهر التالي',
    cancel: 'إلغاء',
    empty: 'لم يتم اختيار تاريخ',
    help: 'تنتقل الأسهم بين الأيام والأسابيع. ينتقل Home وEnd إلى بداية الأسبوع ونهايته. يغيّر Page Up وPage Down الشهر، ومع Shift السنة. يغلق Escape التقويم.'
  }
}

const language = computed(() => translations[props.locale] || translations.en)
const trigger = ref(null)
const dialog = ref(null)
const grid = ref(null)
const isOpen = ref(false)
const selectedDate = ref('')
const displayed = ref({ year: 2026, month: 10 })
const focusedDate = ref(makeDate(2026, 10, 1))

// UTC arithmetic keeps rendering independent of the server's time zone.
// setUTCFullYear also handles years 1–99 without Date's 1900 offset.
function makeDate(year, month, day) {
  const date = new Date(0)
  date.setUTCHours(12, 0, 0, 0)
  date.setUTCFullYear(year, month, day)
  return date
}

function iso(date) {
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0')
  ].join('-')
}

function supported(date) {
  return date.getUTCFullYear() >= 1 && date.getUTCFullYear() <= 9999
}

function fullDate(date) {
  const t = language.value
  const weekday = t.weekdays[date.getUTCDay()]
  const month = t.months[date.getUTCMonth()]
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  return props.locale === 'en'
    ? `${weekday}, ${month} ${day}, ${year}`
    : `${weekday}، ${day} ${month} ${year}`
}

const monthTitle = computed(() =>
  `${language.value.months[displayed.value.month]} ${displayed.value.year}`
)

const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const day = (language.value.firstDay + index) % 7
    return {
      day,
      name: language.value.weekdays[day],
      short: language.value.narrow[day]
    }
  })
)

const weeks = computed(() => {
  const { year, month } = displayed.value
  const first = makeDate(year, month, 1)
  const offset = (first.getUTCDay() - language.value.firstDay + 7) % 7
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = makeDate(year, month, index - offset + 1)
    return {
      date,
      iso: iso(date),
      day: date.getUTCDate(),
      outside: date.getUTCMonth() !== month,
      supported: supported(date)
    }
  })
  return Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
})

const focusedIso = computed(() => iso(focusedDate.value))
const atFirstMonth = computed(() => displayed.value.year === 1 && displayed.value.month === 0)
const atLastMonth = computed(() => displayed.value.year === 9999 && displayed.value.month === 11)

async function focusDay() {
  await nextTick()
  grid.value?.querySelector(`[data-date="${focusedIso.value}"]`)?.focus()
}

async function openCalendar() {
  if (isOpen.value) return

  if (selectedDate.value) {
    const [year, month, day] = selectedDate.value.split('-').map(Number)
    focusedDate.value = makeDate(year, month - 1, day)
  } else {
    focusedDate.value = makeDate(2026, 10, 1)
  }

  displayed.value = {
    year: focusedDate.value.getUTCFullYear(),
    month: focusedDate.value.getUTCMonth()
  }
  isOpen.value = true
  await nextTick()
  dialog.value.showModal()
  await focusDay()
}

function closeCalendar() {
  dialog.value?.close()
}

function handleClosed() {
  isOpen.value = false
  nextTick(() => trigger.value?.focus())
}

function selectDay(date) {
  selectedDate.value = iso(date)
  closeCalendar()
}

function shiftedMonth(date, amount) {
  const target = makeDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)
  const lastDay = makeDate(target.getUTCFullYear(), target.getUTCMonth() + 1, 0).getUTCDate()
  return makeDate(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    Math.min(date.getUTCDate(), lastDay)
  )
}

function changeMonth(amount) {
  const date = shiftedMonth(focusedDate.value, amount)
  if (!supported(date)) return
  focusedDate.value = date
  displayed.value = { year: date.getUTCFullYear(), month: date.getUTCMonth() }
  // Header navigation retains focus on the activated header button.
}

function onDayKeydown(event, date) {
  let target
  const weekdayOffset = (date.getUTCDay() - language.value.firstDay + 7) % 7
  const horizontal = props.dir === 'rtl' ? -1 : 1

  switch (event.key) {
    case 'ArrowLeft':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - horizontal)
      break
    case 'ArrowRight':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + horizontal)
      break
    case 'ArrowUp':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 7)
      break
    case 'ArrowDown':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 7)
      break
    case 'Home':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - weekdayOffset)
      break
    case 'End':
      target = makeDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 6 - weekdayOffset)
      break
    case 'PageUp':
      target = shiftedMonth(date, event.shiftKey ? -12 : -1)
      break
    case 'PageDown':
      target = shiftedMonth(date, event.shiftKey ? 12 : 1)
      break
    default:
      return
  }

  event.preventDefault()
  if (!supported(target)) return
  focusedDate.value = target
  displayed.value = { year: target.getUTCFullYear(), month: target.getUTCMonth() }
  focusDay()
}
</script>

<template>
  <div class="date-picker" :dir="dir" :lang="locale">
    <button
      ref="trigger"
      class="choose-button"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="openCalendar"
    >
      Choose date
    </button>

    <div class="selection">
      <span class="output-label">Selected date</span>
      <output aria-label="Selected date" aria-live="polite" aria-atomic="true">
        <bdi v-if="selectedDate" dir="ltr">{{ selectedDate }}</bdi>
        <span v-else>{{ language.empty }}</span>
      </output>
    </div>

    <dialog
      ref="dialog"
      class="calendar-dialog"
      aria-label="Choose date"
      aria-modal="true"
      :dir="dir"
      :lang="locale"
      @cancel.prevent="closeCalendar"
      @close="handleClosed"
    >
      <div class="month-navigation">
        <button
          class="month-button"
          type="button"
          :aria-label="language.previous"
          :disabled="atFirstMonth"
          @click="changeMonth(-1)"
        >
          <span aria-hidden="true">{{ dir === 'rtl' ? '›' : '‹' }}</span>
        </button>

        <h2 aria-live="polite" aria-atomic="true">{{ monthTitle }}</h2>

        <button
          class="month-button"
          type="button"
          :aria-label="language.next"
          :disabled="atLastMonth"
          @click="changeMonth(1)"
        >
          <span aria-hidden="true">{{ dir === 'rtl' ? '‹' : '›' }}</span>
        </button>
      </div>

      <table ref="grid" class="calendar" role="grid" :aria-label="monthTitle">
        <thead>
          <tr>
            <th
              v-for="weekday in weekdays"
              :key="weekday.day"
              scope="col"
              :aria-label="weekday.name"
            >
              <abbr :title="weekday.name">{{ weekday.short }}</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in weeks" :key="index">
            <td
              v-for="cell in week"
              :key="cell.iso"
              :aria-selected="selectedDate === cell.iso"
            >
              <button
                class="day"
                :class="{
                  outside: cell.outside,
                  selected: selectedDate === cell.iso
                }"
                type="button"
                :data-date="cell.iso"
                :aria-label="fullDate(cell.date)"
                :disabled="!cell.supported"
                :tabindex="cell.iso === focusedIso ? 0 : -1"
                @focus="focusedDate = cell.date"
                @keydown="onDayKeydown($event, cell.date)"
                @click="selectDay(cell.date)"
              >
                {{ cell.day }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="keyboard-help">{{ language.help }}</p>

      <div class="dialog-actions">
        <button class="cancel-button" type="button" @click="closeCalendar">
          {{ language.cancel }}
        </button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.date-picker {
  box-sizing: border-box;
  max-inline-size: 100%;
  color: #182433;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}

button {
  box-sizing: border-box;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

button:focus-visible {
  outline: 3px solid #923900;
  outline-offset: 2px;
}

.choose-button,
.cancel-button {
  min-block-size: 44px;
  padding: 0.6rem 1rem;
  border: 1px solid #244c8a;
  border-radius: 0.5rem;
}

.choose-button {
  color: #fff;
  background: #244c8a;
}

.selection {
  display: grid;
  gap: 0.2rem;
  margin-block-start: 1rem;
  overflow-wrap: anywhere;
}

.output-label {
  font-weight: 650;
}

output {
  color: #35465b;
}

.calendar-dialog {
  box-sizing: border-box;
  inline-size: 336px;
  max-inline-size: calc(100vw - 24px);
  max-block-size: calc(100dvh - 24px);
  margin: auto;
  padding: 14px;
  overflow: auto;
  border: 1px solid #8492a3;
  border-radius: 0.8rem;
  background: #fff;
  color: #182433;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  box-shadow: 0 12px 40px #0003;
}

.calendar-dialog::backdrop {
  background: rgb(12 24 40 / 55%);
}

.month-navigation {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 4px;
  margin-block-end: 8px;
}

h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  overflow-wrap: anywhere;
}

.month-button {
  min-inline-size: 44px;
  min-block-size: 44px;
  padding: 0;
  border: 1px solid #a3adba;
  border-radius: 0.4rem;
  background: #fff;
  color: #182433;
  font-size: 1.8rem;
  line-height: 1;
}

.calendar {
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 3px;
  text-align: center;
}

th {
  block-size: 32px;
  padding: 0;
  color: #435166;
  font-size: 0.8rem;
  font-weight: 600;
}

abbr {
  text-decoration: none;
}

td {
  padding: 0;
}

.day {
  display: block;
  inline-size: 100%;
  min-block-size: 44px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 0.4rem;
  background: #fff;
  color: #182433;
  font-variant-numeric: tabular-nums;
}

.day.outside {
  color: #586578;
}

.day.selected {
  border-color: #123465;
  background: #244c8a;
  color: #fff;
  font-weight: 750;
}

.day:focus-visible {
  position: relative;
  z-index: 1;
  outline-offset: -3px;
}

.day.selected:focus-visible {
  outline-color: #fff;
  box-shadow: 0 0 0 2px #923900;
}

button:disabled {
  opacity: 0.45;
  cursor: default;
}

.keyboard-help {
  margin: 12px 0;
  color: #435166;
  font-size: 0.78rem;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  background: #fff;
  color: #244c8a;
}

@media (hover: hover) {
  .day:hover:not(:disabled):not(.selected),
  .month-button:hover:not(:disabled),
  .cancel-button:hover {
    background: #e9eff8;
  }

  .choose-button:hover {
    background: #183b70;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

@media (forced-colors: active) {
  .day.selected {
    border-color: Highlight;
    background: Highlight;
    color: HighlightText;
    forced-color-adjust: none;
  }

  button:focus-visible {
    outline-color: Highlight;
  }

  .day.selected:focus-visible {
    outline-color: HighlightText;
  }
}
</style>
