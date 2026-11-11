# Avatar

Avatar displays a user image. Until it loads, or when loading fails, the component shows the supplied initials or the custom `fallback` slot. Initials are already formatted text: Avatar does not derive them from a name, change their case or trim graphemes. Without initials or a fallback slot, the placeholder is empty.

Give the root an accessible name with the standard `aria_label` or `aria_labelledBy` prop. Without a name, Avatar is decorative. The inner image has an empty alt; fallback content is hidden from assistive technology to avoid announcing the name twice.

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

Vue, React, Solid and Svelte expose both `Avatar.Group` and the flat `AvatarGroup` export. Angular uses `span[so-avatar]` and `span[so-avatar-group]`; Web Components use `span[is="so-avatar"]` and `span[is="so-avatar-group"]`.

The group receives the number of omitted people through `overflow`. The application chooses the visible children: the group never counts or trims them, and each Avatar keeps its own size and shape. Only a positive finite integer produces the default `+N` count. Zero, negative, fractional and infinite values omit the overflow wrapper. Oren provides `circle`, `rounded` and `rect` shapes, with a circle by default.

The `overflow-content` slot replaces the entire default count and receives `{ count }`. Its name differs from the numeric `overflow` input because JSX and Svelte props and slots share one namespace.

```tsx
<Avatar.Group
  overflow={3}
  overflow-content={({ count }) => (
    <Avatar initials={'+' + count} aria_label={count + ' more people'} />
  )}
>
  <Avatar initials="AL" aria_label="Ada Lovelace" />
</Avatar.Group>
```

Angular uses `<ng-template slot="overflow-content" let-count="count">`. Web Components use light DOM with `slot="overflow-content"`; their slots have no scope under the shared adapter contract, so custom content reads the number from `element.ctrl.overflow`.

The protected markup output and `data-status` expose `idle/loading/loaded/error`; the component publishes the canonical `change:status` event. Loading starts only after the DOM root is ready. SSR renders the fallback, and changing the source immediately invalidates the previous image. See the [generated API contract](./generated/contract.json) for props, events and framework slot syntax.
