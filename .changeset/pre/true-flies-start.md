---
'@soxa-ui/core': minor
'@soxa-ui/plugins': minor
'@soxa-ui/setup': minor
'@soxa-ui/vue': minor
'@soxa-ui/react': minor
'@soxa-ui/solid': minor
'@soxa-ui/svelte': minor
'@soxa-ui/angular': minor
'@soxa-ui/webc': minor
'@soxa-ui/theme-base': patch
---

Standardize property change notifications to { newValue, oldValue }. Update bare-value handlers to read payload.newValue. Object values keep their references without deep cloning; collections and markup sets use shallow container snapshots. Cancelable before events, model bindings, collection operations, and invalidation signals retain their contracts.
