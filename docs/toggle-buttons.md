# ToggleButton и ToggleGroup

ToggleButton — кнопка с сохраняемым нажатым состоянием. ToggleGroup объединяет
кнопки с одиночным или множественным выбором. Состояние сообщает
`aria-pressed`; доступное имя при переключении остаётся постоянным.

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ToggleButton, ToggleGroup } from '@soxa-ui/vue'

const bold = ref(false)
</script>

<template>
  <ToggleButton v-model:pressed="bold" text="Жирный" />

  <ToggleGroup mode="multiple" aria_label="Форматирование">
    <ToggleGroup.Item text="Жирный" selected />
    <ToggleGroup.Item text="Курсив" />
    <ToggleGroup.Item text="Подчёркнутый" disabled />
  </ToggleGroup>
</template>
```

У отдельной кнопки состояние — `pressed`, у элемента группы — `selected`
из коллекции. В режиме `single` повторное нажатие снимает выбор;
`multiple` разрешает несколько выбранных кнопок, `none` запрещает выбор.

Группа принимает `items` и готовый `engine`. Выбор хранит
`TSelectionExtension`; фасад достраивает переданный движок на месте.

```ts
import { createEngineToggleGroup } from '@soxa-ui/core'

const engine = createEngineToggleGroup({
  items: [{ text: 'Список' }, { text: 'Плитка' }],
})

const [list] = engine.extensions.batch.shown
engine.extensions.selection.select(list)

engine.extensions.selection.events.on('change:selection', (selected) => {
  console.log(selected.map((item) => item.text))
})
```

```vue
<ToggleGroup :engine="engine" aria_label="Вид результатов" />
```

`change:selection` группы сообщает выбранные элементы. У слотов `item`,
`item-leading`, `item-trailing` есть `item` в scope; у `item` также
`text` и `selected`. У декларативного элемента используются слоты
`default`, `leading`, `trailing`; его `default` получает `text` и
`selected`. Одиночная кнопка сохраняет слоты Button.

## Клавиатура и оформление

Группа занимает одну остановку Tab. Стрелки по оси `orientation` переносят
фокус, пропуская выключенные, скрытые и неотрисованные кнопки; Home/End ведут
к краям. Горизонтальная навигация учитывает RTL. Space/Enter переключают
выбор, сохраняя фокус. Выбор можно отменить через
`engine.extensions.selection.events` и `item:select:before`.

ToggleButton поддерживает отменяемое `change:pressed:before`; отменённый
DOM-клик также не переключает кнопку. По умолчанию кнопки используют
`type="button"`; явно переданные нативные атрибуты сохраняются.

`size`, `variant` и `view` задаются группе и применяются к её кнопкам.
Виды берутся из реестра Button темы. Узлы сохраняют `so-button` и его
модификаторы; собственные признаки — `so-toggle-button`,
`so-toggle-group`, `so-toggle-group-item`. Выбранное состояние тема читает
из `data-selected`.

Параметр раскладки объявлен в общем слое тем на корне документа:

```css
:root {
  --so-toggle-group-gap: 0.5rem;
}
```

Тема oren поставляет `@soxa-ui/theme-oren/toggle-button.css` и
`@soxa-ui/theme-oren/toggle-group.css`, а также включает их в общий лист.

## Остальные адаптеры

| Адаптер              | Кнопка                           | Группа и элемент                                                   |
| -------------------- | -------------------------------- | ------------------------------------------------------------------ |
| React, Solid, Svelte | `ToggleButton`                   | `ToggleGroup`, `ToggleGroup.Item`                                  |
| Angular              | `<button so-toggle-button>`      | `<div so-toggle-group>`, `<button so-toggle-group-item>`           |
| Web Components       | `<button is="so-toggle-button">` | `<div is="so-toggle-group">`, `<button is="so-toggle-group-item">` |

В React, Solid и Svelte изменение `pressed` приходит в `onChangePressed`;
выбор группы — в `onChangeSelection`. Angular использует `soChangePressed`
и `soChangeSelection`, Web Components — `so:change:pressed` и
`so:change:selection`.
