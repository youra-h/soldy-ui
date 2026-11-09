# @soxa-ui/setup

**What all six adapters share: component descriptors, the assembly that runs on mount, and the
exchange of values with a framework.**

Part of [Soxa UI](https://github.com/youra-h/soxa-ui) — UI components with the logic written once: a
framework-agnostic core and thin adapters that render it in Vue, React, Angular, Svelte, Solid and
Web Components.

A component contract — props, events and slots — is declared once, in a descriptor, and every
adapter derives its API from it. Naming follows each framework's conventions, but the names, the
defaults and the write rules are the same everywhere, because they live here.

## Install

```bash
npm install @soxa-ui/setup
```

It comes with every adapter package, so an application installs it directly only to register
plugins, extensions, a theme or an icon pack.

## Usage

Registering what the application adds to the library — the entry point:

```ts
import { useIcons, useTheme, usePlugins, useExtensions } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'

useIcons(material) // icon roles: check, close, arrowDown, …
useTheme(oren) // plugins and extensions the theme's CSS reads
usePlugins(TButton, [TTimerPlugin]) // your plugin on every Button
useExtensions(TTags, [(owner) => new TTagsHistoryExtension({ owner })])
```

Describing a component — a descriptor is the single record of its public surface:

```ts
import { defineComponent, defineDescriptor } from '@soxa-ui/setup'

export const ButtonDescriptor = defineDescriptor(() =>
  defineComponent({
    ctor: TButton,
    extends: TextableDescriptor(),
    contribution: {
      props: { view: { type: String, triggers: ['change:view'] } },
      slots: { leading: {}, default: {}, trailing: {} },
    },
  }),
)
```

## API metadata

The static JSON export `@soxa-ui/setup/api.json` describes the public component API, including
props, defaults, events, model bindings and slots for all six adapters. It includes
`schemaVersion` and the exact `libraryVersion`; read it at documentation build time without
importing a framework runtime:

```js
import { readFileSync } from 'node:fs'

const api = JSON.parse(
  readFileSync(new URL(import.meta.resolve('@soxa-ui/setup/api.json')), 'utf8'),
)
const button = api.contracts[api.components.find((component) => component.id === 'button').contract]
console.log(button.frameworks.vue.events['change:text']) // @change:text
```

See the [API documentation guide](https://github.com/youra-h/soxa-ui/blob/main/docs/api/README.md)
for the schema, theme-dependent types, plugin transport and website integration.

## Documentation

- [Soxa UI README](https://github.com/youra-h/soxa-ui#readme) — what the library is and how it is
  put together.
- [Architecture overview](https://github.com/youra-h/soxa-ui/blob/main/docs/architecture.md) —
  layers, descriptors, plugins, collections, adapters.

## License

[MIT](https://github.com/youra-h/soxa-ui/blob/main/LICENSE)
