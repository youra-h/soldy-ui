# Separator

A non-interactive boundary between sections. Available from every adapter as
`Separator`, from Angular as `TSeparatorComponent`, and from Web Components as
`<div is="so-separator">`. It inherits the visual component contract, including
`visible`, `rendered`, `direction` and `tag`; it has no slots or content.

| Prop          | Type                         | Default        | Meaning                            |
| ------------- | ---------------------------- | -------------- | ---------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Axis of the line                   |
| `decorative`  | `boolean`                    | `false`        | Omit semantic boundary information |

Semantic boundaries expose `role="separator"` and `aria-orientation`.
Decorative boundaries expose `role="none"` without `aria-orientation`.
Changing `decorative` preserves the current orientation. Separator does not take
keyboard focus and provides no resize or splitter behavior.

## Vue

```vue
<script setup lang="ts">
import { Separator } from '@soxa-ui/vue'
import '@soxa-ui/theme-oren/separator.css'
</script>

<template>
  <section>Account details</section>
  <Separator />
  <section>Notification preferences</section>
  <div style="display: flex; height: 40px; gap: 12px">
    <span>Draft</span>
    <Separator orientation="vertical" decorative />
    <span>Saved</span>
  </div>
</template>
```

## React, Solid and Svelte

Import `Separator` from `@soxa-ui/react`, `@soxa-ui/solid` or `@soxa-ui/svelte`.
Their markup uses the same `orientation` and `decorative` props:

```tsx
import { Separator } from '@soxa-ui/react'

export function Sections() {
  return (
    <>
      <section>Account</section>
      <Separator />
      <section>Preferences</section>
    </>
  )
}
```

## Angular

```ts
import { Component } from '@angular/core'
import { TSeparatorComponent } from '@soxa-ui/angular'

@Component({
  selector: 'app-sections',
  imports: [TSeparatorComponent],
  template: '<section>Account</section><div so-separator></div><section>Preferences</section>',
})
export class Sections {}
```

## Web Components

```ts
import '@soxa-ui/webc/separator'
import '@soxa-ui/theme-oren/separator.css'
```

```html
<section>Account</section>
<div is="so-separator"></div>
<section>Preferences</section>
<div style="height:40px;display:flex">
  <span>Draft</span>
  <div is="so-separator" orientation="vertical" decorative></div>
  <span>Saved</span>
</div>
```

## Core control and events

```ts
import { TSeparator } from '@soxa-ui/core'

const separator = new TSeparator({ orientation: 'vertical' })
separator.events.on('change:orientation', ({ newValue, oldValue }) => {
  console.log(oldValue, newValue)
})
separator.decorative = true
separator.orientation = 'horizontal'
```

Pass the instance as `ctrl` to the adapter. Both `change:orientation` and
`change:decorative` publish `{ newValue, oldValue }` and ignore repeated writes.
Framework event names follow the [shared API conventions](./README.md).

## Theme contract

The root has `so-separator` and one modifier:
`so-separator--orientation-horizontal` or `so-separator--orientation-vertical`.
The base layer sizes the line; Oren paints a neutral border in both schemes and
uses a system color in forced colors. `--so-separator-width` controls thickness
(default `1px`). Give a vertical separator a parent with a definite height.

The existing `Menu.Separator` keeps its independent menu contract and classes.
