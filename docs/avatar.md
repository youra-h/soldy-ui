# Avatar

Avatar показывает изображение пользователя, а до загрузки и при ошибке — готовые инициалы или слот `fallback`. Инициалы сохраняются буквально: компонент не строит их из имени и не меняет регистр. Доступное имя задаёт приложение через штатные `aria_label` или `aria_labelledBy`. Без имени аватар декоративен.

```vue
<Avatar src="/ada.webp" initials="AL" aria_label="Ada Lovelace" size="lg" />
<Avatar.Group :overflow="3">
  <Avatar initials="AL" aria_label="Ada Lovelace" />
  <Avatar initials="GH" aria_label="Grace Hopper" />
  <template #overflow-content="{ count }">
    <Avatar :initials="'+' + count" :aria_label="count + ' more people'" />
  </template>
</Avatar.Group>
```

В React и Solid группа записывается так же: `Avatar.Group`. Плоский экспорт `AvatarGroup` доступен всем адаптерам. Слот счётчика в JSX и Svelte называется `overflow-content`, в Angular — '<ng-template slot="overflow-content" let-count="count">', в Web Components — свет с 'slot="overflow-content"'. Scope у Web Components отсутствует по общему контракту: число доступно у `element.ctrl.overflow`.

```tsx
<Avatar.Group overflow={3} overflow-content={({ count }) => <Avatar initials={'+' + count} />}>
  <Avatar initials="AL" aria_label="Ada Lovelace" />
</Avatar.Group>
```

Приложение выбирает видимых людей и передаёт число оставшихся в `overflow`. Группа не считает и не обрезает детей. Только положительное конечное целое рисует `+N`; 0, отрицательные, дробные и бесконечные значения скрывают счётчик. Размер и форма принадлежат каждому Avatar. Oren задаёт формы `circle`, `rounded`, `rect` и круг по умолчанию.

Состояние изображения `idle/loading/loaded/error` выдаётся как защищённый выход разметки, событие `change:status` и `data-status`. Загрузка начинается после готовности DOM-корня; сервер рисует запасной вариант. Смена URL сразу убирает старую картинку. Подробные props, события и слоты — в [API-контракте](./api/generated/contract.json).
