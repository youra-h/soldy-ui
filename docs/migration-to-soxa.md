# Migrating from Soldy UI to Soxa UI

Soxa UI is the new name of Soldy UI. All 13 public packages move from
`@soldy-ui` to `@soxa-ui`. This guide applies once the Soxa packages are
published; the rename PR itself does not publish packages or deprecate the old ones.

## Replace dependencies

Keep each package suffix and replace its scope:

| Previous package           | New package               |
| -------------------------- | ------------------------- |
| `@soldy-ui/core`           | `@soxa-ui/core`           |
| `@soldy-ui/plugins`        | `@soxa-ui/plugins`        |
| `@soldy-ui/setup`          | `@soxa-ui/setup`          |
| `@soldy-ui/vue`            | `@soxa-ui/vue`            |
| `@soldy-ui/react`          | `@soxa-ui/react`          |
| `@soldy-ui/angular`        | `@soxa-ui/angular`        |
| `@soldy-ui/solid`          | `@soxa-ui/solid`          |
| `@soldy-ui/svelte`         | `@soxa-ui/svelte`         |
| `@soldy-ui/webc`           | `@soxa-ui/webc`           |
| `@soldy-ui/theme-base`     | `@soxa-ui/theme-base`     |
| `@soldy-ui/theme-oren`     | `@soxa-ui/theme-oren`     |
| `@soldy-ui/icons-material` | `@soxa-ui/icons-material` |
| `@soldy-ui/icons-lucide`   | `@soxa-ui/icons-lucide`   |

Remove the old direct dependencies from your application and install their
new counterparts. For example, a Vue application with Oren and Material icons:

```sh
npm uninstall @soldy-ui/vue @soldy-ui/setup @soldy-ui/theme-oren @soldy-ui/icons-material
npm install @soxa-ui/vue @soxa-ui/setup @soxa-ui/theme-oren @soxa-ui/icons-material
```

Use the same release for core, plugins, setup, and adapters. Themes and icon
packs keep their independent versions and declare compatible library versions.
Do not mix adapters from the two scopes: they have separate runtime registries
and framework contexts. Update the whole application and any local plugins or
themes together, then regenerate your application's lockfile with its package manager.

## Update imports and augmentations

```ts
import { Button } from '@soxa-ui/vue'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'

useIcons(material)
useTheme(oren)
```

Replace the scope in every import/export and any package subpath. Update CSS
`@import`, framework configuration, aliases, and TypeScript declarations such
as `declare module '@soldy-ui/core'` and `declare module '@soldy-ui/setup'`
to their corresponding `@soxa-ui` modules. Third-party integrations must also
switch their peer dependencies and module augmentations.

## Preserved contracts

Component names, types, props, events, slots, and behavior are unchanged.
CSS classes `so-*`, attributes `data-so-*`, variables `--so-*`, and
framework prefixes such as Angular `so` and customized built-ins `so-button`
are unchanged. Existing theme rules continue to apply after their imports and
package dependencies are updated.

## Links and history

The target repository address is `https://github.com/youra-h/soxa-ui`.
The repository rename is a separate step; it is not performed by this PR.
The existing local worktree directories and private credential paths stay in
place. Published changelog entries and benchmark results keep the original
names because they describe earlier releases. Old npm packages remain available;
their deprecation is a separate step after the new packages are verified.
