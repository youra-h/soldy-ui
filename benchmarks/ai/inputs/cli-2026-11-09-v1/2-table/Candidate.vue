<script setup>
import { computed, shallowRef, ref, watch } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  locale: { type: String, default: 'en' },
  dir: { type: String, default: 'ltr' },
})

const messages = {
  en: {
    name: 'Name',
    score: 'Score',
    selection: 'Selection',
    selectAll: 'Select all records',
    selectRow: (name, id) => `Select ${name}, record ${id}`,
    selected: (count, total) => `${count} of ${total} records selected`,
    ascending: 'Ascending',
    descending: 'Descending',
    unsorted: 'Not sorted',
    sortAction: (column, direction) => `${column}: sort ${direction}`,
    sortSummary: (column, direction) => `Sorted by ${column}, ${direction}.`,
    scroll: 'Scrollable records table',
    help: 'Use the column buttons to sort. Select records using the checkboxes.',
    empty: 'No records.',
  },
  ru: {
    name: 'Имя',
    score: 'Баллы',
    selection: 'Выбор',
    selectAll: 'Выбрать все записи',
    selectRow: (name, id) => `Выбрать ${name}, запись ${id}`,
    selected: (count, total) => `Выбрано записей: ${count} из ${total}`,
    ascending: 'По возрастанию',
    descending: 'По убыванию',
    unsorted: 'Без сортировки',
    sortAction: (column, direction) => `${column}: сортировать ${direction}`,
    sortSummary: (column, direction) => `Сортировка: ${column}, ${direction}.`,
    scroll: 'Прокручиваемая таблица записей',
    help: 'Сортируйте кнопками в заголовках столбцов. Выбирайте записи флажками.',
    empty: 'Нет записей.',
  },
  ar: {
    name: 'الاسم',
    score: 'الدرجة',
    selection: 'التحديد',
    selectAll: 'تحديد جميع السجلات',
    selectRow: (name, id) => `تحديد ${name}، السجل ${id}`,
    selected: (count, total) => `تم تحديد ${count} من ${total} سجل`,
    ascending: 'تصاعديًا',
    descending: 'تنازليًا',
    unsorted: 'غير مرتب',
    sortAction: (column, direction) => `${column}: ترتيب ${direction}`,
    sortSummary: (column, direction) => `الترتيب حسب ${column}، ${direction}.`,
    scroll: 'جدول سجلات قابل للتمرير',
    help: 'استخدم أزرار عناوين الأعمدة للترتيب ومربعات الاختيار لتحديد السجلات.',
    empty: 'لا توجد سجلات.',
  },
}

const language = computed(() =>
  Object.prototype.hasOwnProperty.call(messages, props.locale) ? props.locale : 'en',
)
const t = computed(() => messages[language.value])
const direction = computed(() => (props.dir === 'rtl' ? 'rtl' : 'ltr'))

const sortKey = ref('name')
const sortDirection = ref('ascending')
const selectedIds = shallowRef(new Set())

const columns = computed(() => [
  { key: 'name', label: t.value.name },
  { key: 'score', label: t.value.score },
])

// Explicit comparisons avoid server/browser collation differences.
// Sorting a copy preserves the supplied rows and their original tie order.
const sortedRows = computed(() => {
  const key = sortKey.value
  const multiplier = sortDirection.value === 'ascending' ? 1 : -1

  return props.rows.slice().sort((a, b) => {
    const left = a[key]
    const right = b[key]
    return (left < right ? -1 : left > right ? 1 : 0) * multiplier
  })
})

const availableIds = computed(() => new Set(props.rows.map((row) => row.id)))

watch(availableIds, (ids) => {
  const next = new Set([...selectedIds.value].filter((id) => ids.has(id)))
  if (next.size !== selectedIds.value.size) selectedIds.value = next
})

const selectedCount = computed(() => {
  let count = 0
  for (const id of selectedIds.value) {
    if (availableIds.value.has(id)) count++
  }
  return count
})

const allSelected = computed(
  () => availableIds.value.size > 0 && selectedCount.value === availableIds.value.size,
)
const partlySelected = computed(
  () => selectedCount.value > 0 && !allSelected.value,
)

const selectionSummary = computed(() =>
  t.value.selected(selectedCount.value, availableIds.value.size),
)

const sortSummary = computed(() =>
  t.value.sortSummary(t.value[sortKey.value], t.value[sortDirection.value]),
)

function nextSortDirection(key) {
  return sortKey.value === key && sortDirection.value === 'ascending'
    ? 'descending'
    : 'ascending'
}

function sortBy(key) {
  const next = nextSortDirection(key)
  sortKey.value = key
  sortDirection.value = next
}

function selectRow(id, checked) {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

function selectAll(checked) {
  selectedIds.value = checked ? new Set(availableIds.value) : new Set()
}
</script>

<template>
  <div class="records" :lang="language" :dir="direction">
    <p class="help">{{ t.help }}</p>

    <p class="summary" role="status" aria-live="polite" aria-atomic="true">
      <strong>{{ selectionSummary }}</strong>
      <span>{{ sortSummary }}</span>
    </p>

    <!--
      Keep every row in the native table so assistive technology, browser
      search, and keyboard navigation can reach all 10,000 records.
      v-memo limits updates to rows whose content or selection changed.
    -->
    <div
      class="table-scroll"
      role="region"
      :aria-label="t.scroll"
      tabindex="0"
    >
      <table>
        <caption>Records</caption>

        <colgroup>
          <col class="selection-column" />
          <col />
          <col class="score-column" />
        </colgroup>

        <thead>
          <tr>
            <th scope="col" class="selection-cell">
              <span class="sr-only">{{ t.selection }}</span>
              <label class="checkbox-target">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate.prop="partlySelected"
                  :aria-checked="partlySelected ? 'mixed' : allSelected ? 'true' : 'false'"
                  :disabled="rows.length === 0"
                  @change="selectAll($event.target.checked)"
                />
                <span class="sr-only">{{ t.selectAll }}</span>
              </label>
            </th>

            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="sortKey === column.key ? sortDirection : undefined"
            >
              <button
                type="button"
                class="sort-button"
                :aria-label="
                  t.sortAction(column.label, t[nextSortDirection(column.key)])
                "
                @click="sortBy(column.key)"
              >
                <span class="column-title">
                  {{ column.label }}
                  <span class="sort-icon" aria-hidden="true">
                    {{
                      sortKey === column.key
                        ? sortDirection === 'ascending' ? '↑' : '↓'
                        : '↕'
                    }}
                  </span>
                </span>
                <span class="sort-state" aria-hidden="true">
                  {{ sortKey === column.key ? t[sortDirection] : t.unsorted }}
                </span>
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="sortedRows.length === 0">
            <td colspan="3" class="empty">{{ t.empty }}</td>
          </tr>

          <tr
            v-for="row in sortedRows"
            :key="row.id"
            v-memo="[row.name, row.score, selectedIds.has(row.id), language]"
            :class="{ selected: selectedIds.has(row.id) }"
          >
            <td class="selection-cell">
              <label class="checkbox-target">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(row.id)"
                  @change="selectRow(row.id, $event.target.checked)"
                />
                <span class="sr-only">{{ t.selectRow(row.name, row.id) }}</span>
              </label>
            </td>
            <th scope="row" class="record-name">
              <bdi>{{ row.name }}</bdi>
            </th>
            <td class="score">
              <bdi>{{ row.score }}</bdi>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.records {
  color-scheme: light;
  box-sizing: border-box;
  inline-size: 100%;
  max-inline-size: 64rem;
  min-inline-size: 0;
  color: #182334;
  background: #ffffff;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}

.records *,
.records *::before,
.records *::after {
  box-sizing: inherit;
}

.help {
  margin: 0 0 0.75rem;
  color: #405066;
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0 0 0.75rem;
}

.summary span {
  color: #405066;
}

.table-scroll {
  inline-size: 100%;
  max-block-size: 65vh;
  max-block-size: min(65vh, 36rem);
  overflow: auto;
  border: 1px solid #78869a;
  border-radius: 0.5rem;
  scrollbar-gutter: stable;
}

table {
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

caption {
  padding: 0.75rem;
  text-align: start;
  font-size: 1.25rem;
  font-weight: 700;
  background: #ffffff;
}

.selection-column {
  inline-size: 3.5rem;
}

.score-column {
  inline-size: 35%;
}

th,
td {
  padding: 0.625rem;
  text-align: start;
  vertical-align: middle;
  overflow-wrap: anywhere;
  border-block-end: 1px solid #cbd3df;
}

thead th {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  padding: 0.25rem;
  background: #edf1f6;
  border-block-end: 2px solid #78869a;
}

.sort-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.125rem;
  inline-size: 100%;
  min-block-size: 3rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  color: #182334;
  background: transparent;
  font: inherit;
  text-align: start;
  overflow-wrap: anywhere;
  cursor: pointer;
  touch-action: manipulation;
}

.column-title {
  font-weight: 700;
}

.sort-icon {
  display: inline-block;
  margin-inline-start: 0.25rem;
}

.sort-state {
  color: #405066;
  font-size: 0.75rem;
  font-weight: 400;
}

.selection-cell {
  padding: 0.25rem;
  text-align: center;
}

.checkbox-target {
  display: flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  cursor: pointer;
  touch-action: manipulation;
}

input[type='checkbox'] {
  flex: none;
  inline-size: 1.375rem;
  block-size: 1.375rem;
  margin: 0;
  accent-color: #174eab;
  cursor: pointer;
}

input:disabled {
  cursor: default;
}

.record-name {
  font-weight: 400;
}

.score {
  font-variant-numeric: tabular-nums;
}

tbody tr.selected > * {
  background: #e5efff;
}

tbody tr.selected > :first-child {
  box-shadow: inset 4px 0 #174eab;
}

.records[dir='rtl'] tbody tr.selected > :first-child {
  box-shadow: inset -4px 0 #174eab;
}

tbody tr:last-child > * {
  border-block-end: 0;
}

.empty {
  padding: 1.5rem 0.75rem;
  text-align: center;
  color: #405066;
}

.table-scroll:focus-visible,
.sort-button:focus-visible,
input:focus-visible {
  outline: 3px solid #174eab;
  outline-offset: 2px;
}

.table-scroll:focus-visible {
  outline-offset: -3px;
}

@media (hover: hover) {
  .sort-button:hover {
    background: #dce5f1;
  }

  .checkbox-target:hover {
    background: #dce5f1;
    border-radius: 0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .table-scroll {
    scroll-behavior: auto;
  }
}

@media (forced-colors: active) {
  tbody tr.selected > * {
    outline: 1px solid Highlight;
    outline-offset: -1px;
  }

  .table-scroll:focus-visible,
  .sort-button:focus-visible,
  input:focus-visible {
    outline-color: Highlight;
  }
}

.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
