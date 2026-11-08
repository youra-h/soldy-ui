# Migrating to the Soxa UI npm scope

All 13 public packages are available under the `@soxa-ui` npm scope.
The first release is `0.3.0-beta.1`, published under the `latest` tag. Replace
the previous scope while keeping each package suffix.

## Replace dependencies

Keep each package suffix and replace its scope:

| Package suffix   | New package               |
| ---------------- | ------------------------- |
| `core`           | `@soxa-ui/core`           |
| `plugins`        | `@soxa-ui/plugins`        |
| `setup`          | `@soxa-ui/setup`          |
| `vue`            | `@soxa-ui/vue`            |
| `react`          | `@soxa-ui/react`          |
| `angular`        | `@soxa-ui/angular`        |
| `solid`          | `@soxa-ui/solid`          |
| `svelte`         | `@soxa-ui/svelte`         |
| `webc`           | `@soxa-ui/webc`           |
| `theme-base`     | `@soxa-ui/theme-base`     |
| `theme-oren`     | `@soxa-ui/theme-oren`     |
| `icons-material` | `@soxa-ui/icons-material` |
| `icons-lucide`   | `@soxa-ui/icons-lucide`   |

Remove every direct dependency on the previous scope from your application's
package manifest, including any declared in devDependencies or peerDependencies.
Install the corresponding packages under the new scope. For example, a Vue
application with Oren and Material icons:

```sh
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
`@import`, framework configuration, aliases, and TypeScript declarations so
module augmentations target `@soxa-ui/core` or `@soxa-ui/setup` instead
of the previous scope. Third-party integrations must also
switch their peer dependencies and module augmentations.

## Preserved contracts

Component names, types, props, events, slots, and behavior are unchanged.
CSS classes `so-*`, attributes `data-so-*`, variables `--so-*`, and
framework prefixes such as Angular `so` and customized built-ins `so-button`
are unchanged. Existing theme rules continue to apply after their imports and
package dependencies are updated.

## Links and history

The repository is [youra-h/soxa-ui](https://github.com/youra-h/soxa-ui/).
Existing issues, pull requests, releases, tags, and Git history are preserved.
Old npm package versions remain available for installation. A deprecation
notice points to the replacement package; it does not remove the old version.

## Verify the migration

Run your package manager's install command to update the lockfile, then check
that the previous scope is absent from both the package manifest and lockfile.
All library packages should resolve under the new scope; do not leave a
transitive dependency or local integration using the previous runtime registry.

Run your application's type check, tests, and production build. Open a page
that uses your components and confirm that theme CSS, icons, overlays, and
framework hydration work as before. Custom themes keep their existing
`so-*`, `data-so-*`, and `--so-*` selectors and variables.
