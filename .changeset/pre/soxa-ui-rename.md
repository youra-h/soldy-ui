---
'@soxa-ui/core': minor
'@soxa-ui/plugins': minor
'@soxa-ui/setup': minor
'@soxa-ui/vue': minor
'@soxa-ui/react': minor
'@soxa-ui/angular': minor
'@soxa-ui/solid': minor
'@soxa-ui/svelte': minor
'@soxa-ui/webc': minor
'@soxa-ui/theme-base': minor
'@soxa-ui/theme-oren': minor
'@soxa-ui/icons-material': minor
'@soxa-ui/icons-lucide': minor
---

Publish Soxa UI packages under the `@soxa-ui` scope. Replace the previous npm scope in every dependency and import (including theme CSS, theme setup, icons, and TypeScript module augmentations) with `@soxa-ui/<package>`. Keep the core, plugins, setup, and adapters on the same release. Component exports, props, events, and the `so-*`, `data-so-*`, and `--so-*` styling contracts are unchanged. See `docs/migration-to-soxa.md` for the package mapping and upgrade steps.
