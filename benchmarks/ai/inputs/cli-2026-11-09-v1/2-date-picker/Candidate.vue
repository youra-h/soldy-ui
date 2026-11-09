<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  locale: {
    type: String,
    default: 'en',
    validator: value => ['en', 'ru', 'ar'].includes(value),
  },
  dir: {
    type: String,
    default: 'ltr',
    validator: value => ['ltr', 'rtl'].includes(value),
  },
})

const trigger = ref(null)
const dialog = ref(null)
const calendar = ref(null)
const isOpen = ref(false)
const selected = ref('')
const activeDate = ref('2026-11-01')
const displayedYear = ref(2026)
const displayedMonth = ref(10)

const language = computed(() => ({
  en: 'en-US',
  ru: 'ru-RU',
  ar: 'ar-EG',
}[props.locale] || 'en-US'))

const weekStart = computed(() => ({
  en: 0,
  ru: 1,
  ar: 6,
}[props.locale] ?? 0))

// Explicit UTC dates avoid differences between server and browser time zones.
// setUTCFullYear also handles years 1–99 without Date.UTC's 1900 offset.
function makeDate(year, month, day) {
  const date = new Date(0)
  date.setUTCFullYear(year, month, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function parseDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return makeDate(year, month - 1, day)
}

function toISO(date) {
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function isSupported(date) {
  return date.getUTCFullYear() >= 1 && date.getUTCFullYear() <= 9999
}

const monthFormatter = computed(() => new Intl.DateTimeFormat(language.value, {
  month: 'long',
  year: 'numeric',
  calendar: 'gregory',
  timeZone: 'UTC',
}))

const fullDateFormatter = computed(() => new Intl.DateTimeFormat(language.value, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  calendar: 'gregory',
  timeZone: 'UTC',
}))

const numberFormatter = computed(() => new Intl.NumberFormat(language.value, {
  useGrouping: false,
}))

const monthTitle = computed(() => monthFormatter.value.format(
  makeDate(displayedYear.value, displayedMonth.value, 1),
))

const weekdays = computed(() => {
  const short = new Intl.DateTimeFormat(language.value, {
    weekday: 'short',
    timeZone: 'UTC',
  })
  const long = new Intl.DateTimeFormat(language.value, {
    weekday: 'long',
    timeZone: 'UTC',
  })

  return Array.from({ length: 7 }, (_, index) => {
    // November 1, 2026 is a Sunday.
    const date = makeDate(2026, 10, 1 + ((weekStart.value + index) % 7))
    return { short: short.format(date), long: long.format(date) }
  })
})

const weeks = computed(() => {
  const first = makeDate(displayedYear.value, displayedMonth.value, 1)
  const offset = (first.getUTCDay() - weekStart.value + 7) % 7

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = makeDate(displayedYear.value, displayedMonth.value, 1 - offset + index)
    return {
      iso: toISO(date),
      label: fullDateFormatter.value.format(date),
      number: numberFormatter.value.format(date.getUTCDate()),
      outside: date.getUTCMonth() !== displayedMonth.value,
      supported: isSupported(date),
    }
  })

  return Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7))
})

const canGoPrevious = computed(() =>
  displayedYear.value > 1 || displayedMonth.value > 0,
)

const canGoNext = computed(() =>
  displayedYear.value < 9999 || displayedMonth.value < 11,
)

async function focusActiveDay() {
  await nextTick()
  if (!isOpen.value) return
  calendar.value?.querySelector(
    `button[data-date="${activeDate.value}"]`,
  )?.focus()
}

function displayDate(date) {
  if (!isSupported(date)) return false
  activeDate.value = toISO(date)
  displayedYear.value = date.getUTCFullYear()
  displayedMonth.value = date.getUTCMonth()
  return true
}

async function openCalendar() {
  if (isOpen.value) return

  if (selected.value) displayDate(parseDate(selected.value))
  isOpen.value = true
  await nextTick()

  dialog.value?.showModal()
  await focusActiveDay()
}

async function closeCalendar() {
  if (!isOpen.value) return
  isOpen.value = false
  dialog.value?.close()
  await nextTick()
  trigger.value?.focus()
}

function selectDate(iso) {
  selected.value = iso
  displayDate(parseDate(iso))
  closeCalendar()
}

function moveDays(amount) {
  const date = parseDate(activeDate.value)
  date.setUTCDate(date.getUTCDate() + amount)
  if (displayDate(date)) focusActiveDay()
}

function shiftedMonth(amount) {
  const current = parseDate(activeDate.value)
  const target = makeDate(current.getUTCFullYear(), current.getUTCMonth() + amount, 1)
  if (!isSupported(target)) return null

  const lastDay = makeDate(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    0,
  ).getUTCDate()

  target.setUTCDate(Math.min(current.getUTCDate(), lastDay))
  return target
}

function moveMonths(amount, focusDay = false) {
  const date = shiftedMonth(amount)
  if (!date) return
  displayDate(date)
  if (focusDay) focusActiveDay()
}

function onDayKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return

  const date = parseDate(activeDate.value)
  const weekOffset = (date.getUTCDay() - weekStart.value + 7) % 7

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      moveDays(props.dir === 'rtl' ? 1 : -1)
      break
    case 'ArrowRight':
      event.preventDefault()
      moveDays(props.dir === 'rtl' ? -1 : 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveDays(-7)
      break
    case 'ArrowDown':
      event.preventDefault()
      moveDays(7)
      break
    case 'Home':
      event.preventDefault()
      moveDays(-weekOffset)
      break
    case 'End':
      event.preventDefault()
      moveDays(6 - weekOffset)
      break
    case 'PageUp':
      event.preventDefault()
      moveMonths(event.shiftKey ? -12 : -1, true)
      break
    case 'PageDown':
      event.preventDefault()
      moveMonths(event.shiftKey ? 12 : 1, true)
      break
  }
}

function onDialogKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeCalendar()
    return
  }

  if (event.key !== 'Tab') return

  const controls = Array.from(dialog.value?.querySelectorAll(
    'button:not(:disabled):not([tabindex="-1"])',
  ) || [])

  const first = controls[0]
  const last = controls[controls.length - 1]
  const focused = dialog.value?.ownerDocument.activeElement

  if (event.shiftKey && (focused === first || !controls.includes(focused))) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && (focused === last || !controls.includes(focused))) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <div class="date-picker" :dir="props.dir">
    <button
      ref="trigger"
      class="choose-button"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="openCalendar"
    >
      Choose date
      <span aria-hidden="true">▦</span>
    </button>

    <div class="selection">
      <span class="selection-label">Selected date</span>
      <output aria-label="Selected date" aria-live="polite" aria-atomic="true">
        <span v-if="selected" dir="ltr">{{ selected }}</span>
        <span v-else>No date selected</span>
      </output>
    </div>

    <dialog
      v-if="isOpen"
      ref="dialog"
      class="calendar-dialog"
      aria-label="Choose date"
      aria-modal="true"
      :dir="props.dir"
      @cancel.prevent="closeCalendar"
      @keydown="onDialogKeydown"
    >
      <h2>Choose date</h2>

      <div class="month-navigation">
        <button
          class="month-button"
          type="button"
          aria-label="Previous month"
          :disabled="!canGoPrevious"
          @click="moveMonths(-1)"
        >
          <span aria-hidden="true">{{ props.dir === 'rtl' ? '›' : '‹' }}</span>
        </button>

        <h3 :lang="language" aria-live="polite" aria-atomic="true">
          {{ monthTitle }}
        </h3>

        <button
          class="month-button"
          type="button"
          aria-label="Next month"
          :disabled="!canGoNext"
          @click="moveMonths(1)"
        >
          <span aria-hidden="true">{{ props.dir === 'rtl' ? '‹' : '›' }}</span>
        </button>
      </div>

      <table
        ref="calendar"
        class="calendar"
        role="grid"
        :aria-label="monthTitle"
        :lang="language"
      >
        <thead>
          <tr role="row">
            <th
              v-for="(weekday, index) in weekdays"
              :key="index"
              role="columnheader"
              scope="col"
              :aria-label="weekday.long"
            >
              <abbr :title="weekday.long">{{ weekday.short }}</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in weeks" :key="index" role="row">
            <td
              v-for="day in week"
              :key="day.iso"
              role="gridcell"
              :aria-selected="day.iso === selected"
            >
              <button
                type="button"
                class="day"
                :class="{
                  outside: day.outside,
                  selected: day.iso === selected,
                }"
                :data-date="day.iso"
                :aria-label="day.label"
                :tabindex="day.iso === activeDate ? 0 : -1"
                :disabled="!day.supported"
                @focus="activeDate = day.iso"
                @keydown="onDayKeydown"
                @click="selectDate(day.iso)"
              >
                {{ day.number }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="keyboard-help">
        Arrow keys move by day or week. Home / End move to the start / end
        of the week. Page Up / Down change month; add Shift to change year.
        Enter or Space selects. Escape cancels.
      </p>

      <div class="dialog-actions">
        <button class="cancel-button" type="button" @click="closeCalendar">
          Cancel
        </button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.date-picker,
.calendar-dialog {
  box-sizing: border-box;
  color: #172b40;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}

.date-picker *,
.calendar-dialog * {
  box-sizing: border-box;
}

.date-picker {
  inline-size: 100%;
  max-inline-size: 24rem;
  padding: 1rem;
}

button {
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible {
  outline: 3px solid #955000;
  outline-offset: 2px;
}

.choose-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-block-size: 48px;
  inline-size: 100%;
  padding: 0.65rem 1rem;
  border: 2px solid #174f87;
  border-radius: 0.6rem;
  color: #ffffff;
  background: #174f87;
  font-weight: 650;
}

.choose-button span {
  font-size: 1.5rem;
  line-height: 1;
}

.selection {
  display: grid;
  gap: 0.25rem;
  margin-block-start: 1rem;
}

.selection-label {
  font-weight: 650;
}

output {
  display: block;
  min-block-size: 1.5em;
  color: #384c60;
  font-variant-numeric: tabular-nums;
}

.calendar-dialog {
  inline-size: min(24rem, calc(100vw - 16px));
  max-inline-size: calc(100vw - 16px);
  max-block-size: calc(100vh - 24px);
  max-block-size: calc(100dvh - 24px);
  margin: auto;
  padding: 12px;
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid #8191a2;
  border-radius: 0.85rem;
  background: #ffffff;
  box-shadow: 0 12px 40px #172b4033;
}

.calendar-dialog::backdrop {
  background: #10263d99;
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  line-height: 1.3;
}

.month-navigation {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 0.25rem;
  margin-block-end: 0.5rem;
}

h3 {
  margin: 0;
  text-align: center;
  overflow-wrap: anywhere;
  font-size: 1rem;
  font-weight: 700;
}

.month-button,
.cancel-button {
  min-block-size: 44px;
  border: 1px solid #75879a;
  border-radius: 0.4rem;
  color: #172b40;
  background: #ffffff;
}

.month-button {
  inline-size: 44px;
  padding: 0;
  font-size: 1.8rem;
  line-height: 1;
}

.calendar {
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

.calendar th {
  height: 36px;
  padding: 0;
  color: #425569;
  font-size: 0.78rem;
  font-weight: 650;
  text-align: center;
}

.calendar abbr {
  text-decoration: none;
}

.calendar td {
  padding: 0;
  text-align: center;
}

.day {
  position: relative;
  display: block;
  inline-size: 100%;
  min-block-size: 44px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 0.4rem;
  color: #172b40;
  background: #ffffff;
  font-variant-numeric: tabular-nums;
}

.day.outside {
  color: #526477;
  background: #f1f4f7;
}

.day.selected {
  border-color: #174f87;
  color: #ffffff;
  background: #174f87;
  font-weight: 750;
}

.day:focus-visible {
  z-index: 1;
  outline-offset: -3px;
  outline-width: 3px;
}

.day.selected:focus-visible {
  outline-color: #ffffff;
}

button:disabled {
  cursor: default;
  color: #657180;
  background: #edf0f3;
  border-color: #c4ccd5;
}

.keyboard-help {
  margin: 0.9rem 0;
  color: #425569;
  font-size: 0.8rem;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  padding: 0.5rem 1rem;
  font-weight: 600;
}

@media (hover: hover) {
  .choose-button:hover {
    background: #103e6b;
  }

  .month-button:hover:not(:disabled),
  .cancel-button:hover {
    background: #e9eff6;
  }

  .day:hover:not(:disabled):not(.selected) {
    background: #dce9f6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .date-picker,
  .calendar-dialog,
  .date-picker *,
  .calendar-dialog * {
    animation: none;
    transition: none;
    scroll-behavior: auto;
  }
}

@media (forced-colors: active) {
  .day.selected {
    border-color: Highlight;
    color: HighlightText;
    background: Highlight;
    forced-color-adjust: none;
  }

  button:focus-visible,
  .day.selected:focus-visible {
    outline-color: CanvasText;
  }
}
</style>
