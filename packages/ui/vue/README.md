# @soxa-ui/vue

**The Vue adapter: Soxa UI components rendered on the headless models of the core.**

Part of [Soxa UI](https://github.com/youra-h/soxa-ui) — UI components with the logic written once: a
framework-agnostic core and thin adapters that render it in Vue, React, Angular, Svelte, Solid and
Web Components.

The adapter is wiring, not behavior: it connects a core model to Vue's reactivity and renders the
markup — BEM classes `so-*` and `data-*` state attributes. Props, events and slots come from the
component descriptor, so they match the other five adapters; only the spelling is Vue's.

## Install

```bash
npm install @soxa-ui/vue @soxa-ui/setup @soxa-ui/theme-oren @soxa-ui/icons-material
```

Install `@soxa-ui/setup` as a direct dependency for the `useIcons` and `useTheme` imports below.
Keep it on the same version as `@soxa-ui/vue`.

Vue `^3.5` is a peer dependency. A theme and an icon pack are separate packages — pick the ones you
want.

## Usage

Compound components name their parts with a dot:

```vue
<script setup lang="ts">
import { Accordion } from '@soxa-ui/vue'
</script>

<template>
  <Accordion mode="multiple">
    <Accordion.Item text="First" value="a" :selected="true">
      <p>Content A</p>
    </Accordion.Item>
    <Accordion.Item text="Second" value="b">
      <p>Content B</p>
    </Accordion.Item>
  </Accordion>
</template>
```

The same component can be driven from code — pass a core instance as `ctrl`, and both sides see the
same state and events:

```vue
<script setup lang="ts">
import { TButton } from '@soxa-ui/core'
import { Button } from '@soxa-ui/vue'

const btn = new TButton({ text: 'Save' })
</script>

<template>
  <Button :ctrl="btn" @action:press="btn.disabled = true" />
</template>
```

The application plugs in a theme and an icon pack once:

```ts
import { createApp } from 'vue'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import App from './App.vue'

import '@soxa-ui/theme-oren'

useIcons(material)
useTheme(oren)

createApp(App).mount('#app')
```

`@soxa-ui/theme-oren` is the stylesheet of every component. To take only the components your
pages use, import their stylesheets instead — `@soxa-ui/theme-oren/button.css`,
`@soxa-ui/theme-oren/select.css`, one per component, each with the shared part of the theme
(the theme's README, [Only the components you use](https://github.com/youra-h/soxa-ui/tree/main/packages/themes/oren#only-the-components-you-use)).

## Two-way binding

Use named `v-model` bindings with the property you want to control: `v-model:value` for a field's
value, `v-model:open` for a panel's open state, or `v-model:selected` for an item's selection.
A component can have several bindings at once:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select } from '@soxa-ui/vue'

const text = ref('')
const selection = ref('a')
const opened = ref(false)
const options = [
  { value: 'a', text: 'First' },
  { value: 'b', text: 'Second' },
]
</script>

<template>
  <Input v-model:value="text" />
  <Select v-model:value="selection" v-model:open="opened" :items="options" />
</template>
```

`v-model:value="text"` is shorthand for `:value="text"` and `@update:value="text = $event"`.
The same rule applies to other writable properties with change notifications: each uses
`update:<property>` with the new value as its payload.

Bare `v-model` is unsupported: Vue expands it to `modelValue` and `update:modelValue`, which
Soxa components do not expose. Always specify the property name.

## Several Vue apps on one page

Soxa builds the `id`s of component parts and the owner marks of panels (`data-owner`) on Vue's
`useId`, so that the server and the browser render the same markup. `useId` numbers ids within an
app, and when a page runs several Vue apps — islands, micro-frontends — their ids coincide: a menu,
popover or dialog of one app then finds the panel of another. Give each app a prefix of its own
before it mounts — on the server too, if the app is rendered there:

```ts
app.config.idPrefix = 'cart'
```

## Documentation

- [Soxa UI README](https://github.com/youra-h/soxa-ui#readme) — the component set and what each
  adapter implements so far.
- [Architecture overview](https://github.com/youra-h/soxa-ui/blob/main/docs/architecture.md) —
  layers, descriptors, plugins, collections, adapters.

## Public API

The package entry exports application components, their consumer types, the locale provider,
and the supported icon and toast helpers. Component props, slots, events, refs and core models
passed through `ctrl` remain the supported ways to customize the UI. Models come from
`@soxa-ui/core`; theme, icon and external-plugin registration comes from `@soxa-ui/setup`.

Assembly functions, adapter profiles, bindings, generated metadata and rendering templates
are private implementation details. They are no longer exported from the package entry, and
there is no public `/internal` entry. Code that imported them must use the component contract
instead. Building a new adapter component from Soxa's assembly helpers is not a supported
public SDK.

Component props types, including `ButtonProps`, are available from the package entry.

## License

[MIT](https://github.com/youra-h/soxa-ui/blob/main/LICENSE)

## Breadcrumbs

Breadcrumbs provides an ordered navigation trail with native links, localized accessible names
and an overflow menu. See the [API and examples](../../../docs/api/breadcrumbs.md).

## Badge

Badge is a noninteractive inline label, capped numeric counter or dot. Set its text with
`value`; its only slot is `anchor`. There is no default/content slot. A numeric value above
`max` (99 by default) displays `max+` without changing the stored value. Zero is visible,
strings are unchanged and nonfinite numbers are empty. A negative or nonfinite limit uses 99.
`dot` hides only the displayed value. Size, variant and view come from the theme; oren supports
`filled` (the default) and `outlined`.

```vue
<Badge value="New" />
<Badge :value="120" aria_label="120 unread" />
<Badge dot aria_label="Online" />
<Badge :value="3" aria_label="3 unread">
  <template #anchor><Button>Inbox</Button></template>
</Badge>
```

The wrapper stays neutral. An indicator with `aria_label` or `aria_labelledBy` is an image
with that accessible name; an unnamed label is ordinary text, and an unnamed dot is decorative.
The anchor keeps its own accessible name, clicks and focus. Badge adds no live region.
The application translates the accessible name. Placement above the anchor's logical end is CSS
and follows RTL. Import `@soxa-ui/theme-oren/badge.css` for the standalone stylesheet.

## AlertDialog

Use AlertDialog for a modal confirmation with localized Cancel and Confirm actions.
The action/cancel content slots change labels; the footer slot replaces the entire row,
including with zero actions. The application performs the operation after the confirm event.
See the [AlertDialog contract and adapter examples](../../../docs/components/alert-dialog.md).
