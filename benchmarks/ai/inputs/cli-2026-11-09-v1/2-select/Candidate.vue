<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
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

const id = useId()
const inputId = `${id}-input`
const labelId = `${id}-label`
const listId = `${id}-list`
const helpId = `${id}-help`

const root = ref(null)
const input = ref(null)
const list = ref(null)
const open = ref(false)
const draft = ref('')
const query = ref('')
const composing = ref(false)
const activeIndex = ref(-1)
const selected = ref(new Set())

function normalize(text) {
  return String(text).toLocaleLowerCase(props.locale)
}

const filteredItems = computed(() => {
  const needle = normalize(query.value)
  return props.items.filter(item => normalize(item.text).includes(needle))
})

const selectedItems = computed(() => {
  const labels = new Map(props.items.map(item => [item.value, item.text]))
  return [...selected.value].map(value => ({
    value,
    text: labels.get(value) ?? value,
  }))
})

const activeId = computed(() => {
  if (!open.value || !filteredItems.value[activeIndex.value]) return undefined
  return optionId(activeIndex.value)
})

const status = computed(() => {
  const selection = `${selected.value.size} selected.`
  return open.value
    ? `${filteredItems.value.length} options available. ${selection}`
    : selection
})

function optionId(index) {
  return `${id}-option-${index}`
}

function preferredIndex() {
  if (!filteredItems.value.length) return -1
  const needle = normalize(query.value)
  const index = filteredItems.value.findIndex(item =>
    normalize(item.text).startsWith(needle),
  )
  return index < 0 ? 0 : index
}

async function revealActive() {
  await nextTick()
  if (!open.value || activeIndex.value < 0) return

  const container = list.value
  const option = container?.children[activeIndex.value]
  if (!container || !option) return

  const containerRect = container.getBoundingClientRect()
  const optionRect = option.getBoundingClientRect()
  const top = containerRect.top + container.clientTop
  const bottom = top + container.clientHeight

  if (optionRect.top < top) {
    container.scrollTop += optionRect.top - top
  } else if (optionRect.bottom > bottom) {
    container.scrollTop += optionRect.bottom - bottom
  }
}

function activate(index) {
  activeIndex.value = index
  void revealActive()
}

function showOptions() {
  open.value = true
  activate(preferredIndex())
}

function closeOptions(returnFocus = false) {
  open.value = false
  activeIndex.value = -1
  if (returnFocus) input.value?.focus({ preventScroll: true })
}

function togglePopup() {
  if (composing.value) return
  if (open.value) closeOptions(true)
  else {
    showOptions()
    input.value?.focus({ preventScroll: true })
  }
}

function toggleSelection(item) {
  if (composing.value || !item) return
  const next = new Set(selected.value)
  if (next.has(item.value)) next.delete(item.value)
  else next.add(item.value)
  selected.value = next
}

function chooseOption(item, index) {
  if (composing.value) return
  toggleSelection(item)
  activate(index)
  input.value?.focus({ preventScroll: true })
}

function removeSelection(value) {
  if (composing.value) return
  const next = new Set(selected.value)
  next.delete(value)
  selected.value = next
  input.value?.focus({ preventScroll: true })
}

function commitQuery(value) {
  query.value = value
  open.value = true
  activate(preferredIndex())
}

function onInput(event) {
  draft.value = event.target.value
  if (composing.value || event.isComposing) return
  commitQuery(draft.value)
}

function onCompositionStart() {
  composing.value = true
}

function onCompositionEnd(event) {
  composing.value = false
  draft.value = event.target.value
  commitQuery(draft.value)
}

function onKeydown(event) {
  // IME confirmation must never toggle or remove a selected value.
  if (composing.value || event.isComposing || event.keyCode === 229) return

  if (event.key === 'Escape') {
    if (open.value) {
      event.preventDefault()
      event.stopPropagation()
      closeOptions(true)
    }
    return
  }

  if (event.key === 'Tab') {
    closeOptions()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    const count = filteredItems.value.length

    if (!open.value) {
      open.value = true
      activate(event.key === 'ArrowUp' ? count - 1 : preferredIndex())
    } else if (count) {
      const next =
        activeIndex.value < 0
          ? event.key === 'ArrowUp' ? count - 1 : 0
          : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
      activate(next)
    }
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (!open.value) showOptions()
    else if (!event.repeat) toggleSelection(filteredItems.value[activeIndex.value])
  }

  // All other keys retain native editing behavior, including Space,
  // Home, End, selection shortcuts, and printable prefix input.
}

function onFocusout(event) {
  if (!root.value?.contains(event.relatedTarget)) closeOptions()
}

watch(filteredItems, () => {
  if (open.value) activate(preferredIndex())
  else activeIndex.value = -1
})
</script>

<template>
  <div
    ref="root"
    class="item-select"
    :dir="props.dir"
    @focusout="onFocusout"
  >
    <label :id="labelId" class="label" :for="inputId">
      Choose items
    </label>

    <p :id="helpId" class="help">
      Type to filter. Use ↑ and ↓ to explore, Enter to select or deselect,
      and Escape to close.
    </p>

    <div class="field">
      <input
        :id="inputId"
        ref="input"
        class="search"
        type="text"
        role="combobox"
        autocomplete="off"
        autocapitalize="none"
        :spellcheck="false"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        :aria-describedby="helpId"
        :value="draft"
        placeholder="Search items"
        @click="!open && showOptions()"
        @input="onInput"
        @keydown="onKeydown"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
      />

      <button
        class="popup-button"
        type="button"
        :aria-label="open ? 'Close options' : 'Show options'"
        :aria-expanded="open"
        :aria-controls="listId"
        @click="togglePopup"
        @keydown.esc.prevent="closeOptions(true)"
      >
        <span aria-hidden="true">{{ open ? '▴' : '▾' }}</span>
      </button>
    </div>

    <div v-show="open" class="popup">
      <ul
        :id="listId"
        ref="list"
        class="options"
        role="listbox"
        aria-multiselectable="true"
        :aria-labelledby="labelId"
      >
        <li
          v-for="(item, index) in filteredItems"
          :id="optionId(index)"
          :key="item.value"
          class="option"
          :class="{
            active: index === activeIndex,
            selected: selected.has(item.value),
          }"
          role="option"
          :aria-selected="selected.has(item.value)"
          @mousedown.prevent
          @click="chooseOption(item, index)"
        >
          <span class="check" aria-hidden="true">
            {{ selected.has(item.value) ? '✓' : '' }}
          </span>
          <span class="option-text">{{ item.text }}</span>
        </li>
      </ul>
      <p v-if="!filteredItems.length" class="empty">No matching items.</p>
    </div>

    <p class="status" role="status" aria-live="polite" aria-atomic="true">
      {{ status }}
    </p>

    <ul v-if="selectedItems.length" class="selections" aria-label="Selected items">
      <li v-for="item in selectedItems" :key="item.value" class="selection">
        <span class="selected-text">{{ item.text }}</span>
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${item.text}`"
          @click="removeSelection(item.value)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </li>
    </ul>

    <!-- Repeated native fields submit each selected value with an enclosing form. -->
    <input
      v-for="value in selected"
      :key="value"
      type="hidden"
      name="items"
      :value="value"
    />
  </div>
</template>

<style scoped>
.item-select {
  box-sizing: border-box;
  inline-size: 100%;
  max-inline-size: 30rem;
  min-inline-size: 0;
  color: #172033;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  text-align: start;
}

.item-select *,
.item-select *::before,
.item-select *::after {
  box-sizing: border-box;
}

.label {
  display: block;
  font-weight: 700;
}

.help {
  margin: 0.375rem 0 0.75rem;
  color: #475569;
  font-size: 0.875rem;
}

.field {
  display: flex;
  min-inline-size: 0;
  border: 1px solid #64748b;
  border-radius: 0.5rem;
  background: #fff;
}

.field:focus-within {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.search {
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: 48px;
  padding: 0.625rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  color: #172033;
  background: #fff;
  font: inherit;
}

.search::placeholder {
  color: #526078;
  opacity: 1;
}

.search:focus {
  outline: none;
}

button {
  flex-shrink: 0;
  min-inline-size: 44px;
  min-block-size: 44px;
  border: 0;
  color: #172033;
  background: transparent;
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -4px;
  border-radius: 0.375rem;
}

button:hover {
  background: #e2e8f0;
}

.popup-button {
  border-inline-start: 1px solid #64748b;
  border-start-end-radius: 0.5rem;
  border-end-end-radius: 0.5rem;
}

.popup {
  margin-block-start: 0.5rem;
  overflow: hidden;
  border: 1px solid #64748b;
  border-radius: 0.5rem;
  background: #fff;
}

.options {
  max-block-size: min(18rem, 45vh);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  touch-action: pan-y;
  scroll-behavior: auto;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-block-size: 48px;
  padding: 0.625rem 0.75rem;
  border: 2px solid transparent;
  cursor: pointer;
}

.option + .option {
  border-block-start-color: #e2e8f0;
}

.option:hover {
  background: #f1f5f9;
}

.option.selected {
  background: #e8f0ff;
}

.option.active {
  border-color: #1d4ed8;
  background: #dbeafe;
}

.check {
  display: inline-flex;
  flex: 0 0 1.25rem;
  align-items: center;
  justify-content: center;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  border: 1px solid #526078;
  border-radius: 0.2rem;
  color: #fff;
  background: #fff;
  font-weight: 700;
  line-height: 1;
}

.selected .check {
  border-color: #1e40af;
  background: #1e40af;
}

.option-text,
.selected-text {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
}

.empty {
  margin: 0;
  padding: 0.75rem;
  color: #475569;
}

.status {
  margin: 0.625rem 0;
  color: #475569;
  font-size: 0.875rem;
}

.selections {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.selection {
  display: flex;
  align-items: center;
  max-inline-size: 100%;
  padding-inline-start: 0.75rem;
  border: 1px solid #64748b;
  border-radius: 0.5rem;
  background: #f1f5f9;
}

.remove {
  margin-inline-start: 0.25rem;
  border-radius: 0.5rem;
  font-size: 1.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .item-select * {
    animation: none;
    transition: none;
    scroll-behavior: auto;
  }
}

@media (forced-colors: active) {
  .option.active {
    border-color: Highlight;
  }

  .selected .check {
    color: HighlightText;
    background: Highlight;
    forced-color-adjust: none;
  }

  .field:focus-within,
  button:focus-visible {
    outline-color: Highlight;
  }
}
</style>
