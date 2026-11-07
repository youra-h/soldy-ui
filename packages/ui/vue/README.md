# @soldy-ui/vue

**The Vue adapter: Soldy UI components rendered on the headless models of the core.**

Part of [Soldy UI](https://github.com/youra-h/soldy-ui) — UI components with the logic written once: a
framework-agnostic core and thin adapters that render it in Vue, React, Angular, Svelte, Solid and
Web Components.

The adapter is wiring, not behavior: it connects a core model to Vue's reactivity and renders the
markup — BEM classes `so-*` and `data-*` state attributes. Props, events and slots come from the
component descriptor, so they match the other five adapters; only the spelling is Vue's.

## Install

```bash
npm install @soldy-ui/vue @soldy-ui/setup @soldy-ui/theme-oren @soldy-ui/icons-material
```

Install `@soldy-ui/setup` as a direct dependency for the `useIcons` and `useTheme` imports below.
Keep it on the same version as `@soldy-ui/vue`.

Vue `^3.5` is a peer dependency. A theme and an icon pack are separate packages — pick the ones you
want.

## Usage

Compound components name their parts with a dot:

```vue
<script setup lang="ts">
import { Accordion } from '@soldy-ui/vue'
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
import { TButton } from '@soldy-ui/core'
import { Button } from '@soldy-ui/vue'

const btn = new TButton({ text: 'Save' })
</script>

<template>
  <Button :ctrl="btn" @action:press="btn.disabled = true" />
</template>
```

The application plugs in a theme and an icon pack once:

```ts
import { createApp } from 'vue'
import { useIcons, useTheme } from '@soldy-ui/setup'
import * as material from '@soldy-ui/icons-material'
import oren from '@soldy-ui/theme-oren/setup'
import App from './App.vue'

import '@soldy-ui/theme-oren'

useIcons(material)
useTheme(oren)

createApp(App).mount('#app')
```

`@soldy-ui/theme-oren` is the stylesheet of every component. To take only the components your
pages use, import their stylesheets instead — `@soldy-ui/theme-oren/button.css`,
`@soldy-ui/theme-oren/select.css`, one per component, each with the shared part of the theme
(the theme's README, [Only the components you use](https://github.com/youra-h/soldy-ui/tree/main/packages/themes/oren#only-the-components-you-use)).

## Two-way binding

Use named `v-model` bindings with the property you want to control: `v-model:value` for a field's
value, `v-model:open` for a panel's open state, or `v-model:selected` for an item's selection.
A component can have several bindings at once:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input, Select } from '@soldy-ui/vue'

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
Soldy components do not expose. Always specify the property name.

## Several Vue apps on one page

Soldy builds the `id`s of component parts and the owner marks of panels (`data-owner`) on Vue's
`useId`, so that the server and the browser render the same markup. `useId` numbers ids within an
app, and when a page runs several Vue apps — islands, micro-frontends — their ids coincide: a menu,
popover or dialog of one app then finds the panel of another. Give each app a prefix of its own
before it mounts — on the server too, if the app is rendered there:

```ts
app.config.idPrefix = 'cart'
```

## Documentation

- [Soldy UI README](https://github.com/youra-h/soldy-ui#readme) — the component set and what each
  adapter implements so far.
- [Architecture overview](https://github.com/youra-h/soldy-ui/blob/main/docs/architecture.md) —
  layers, descriptors, plugins, collections, adapters.

## Public API

The package entry exports application components, their consumer types, the locale provider,
and the supported icon and toast helpers. Component props, slots, events, refs and core models
passed through `ctrl` remain the supported ways to customize the UI. Models come from
`@soldy-ui/core`; theme, icon and external-plugin registration comes from `@soldy-ui/setup`.

Assembly functions, adapter profiles, bindings, generated metadata and rendering templates
are private implementation details. They are no longer exported from the package entry, and
there is no public `/internal` entry. Code that imported them must use the component contract
instead. Building a new adapter component from Soldy's assembly helpers is not a supported
public SDK.

Component props types, including `ButtonProps`, are available from the package entry.

## License

[MIT](https://github.com/youra-h/soldy-ui/blob/main/LICENSE)
