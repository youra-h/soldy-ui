---
'@soxa-ui/setup': minor
'@soxa-ui/angular': minor
'@soxa-ui/vue': minor
'@soxa-ui/react': minor
'@soxa-ui/solid': minor
'@soxa-ui/svelte': minor
'@soxa-ui/webc': minor
---

Publish only explicitly declared descriptor events. Internal property triggers no longer appear as component callbacks, Vue events, Angular outputs or Web Component events. Declare application notifications in contribution.events; property state refresh and two-way model updates remain driven by triggers.
