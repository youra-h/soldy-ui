---
'@soxa-ui/plugins': minor
'@soxa-ui/setup': minor
'@soxa-ui/angular': minor
'@soxa-ui/vue': minor
'@soxa-ui/solid': minor
'@soxa-ui/svelte': minor
'@soxa-ui/react': minor
'@soxa-ui/webc': minor
---

Remove public plugin creation events. Replace namespace:create handlers with bundle:create and bundle.get(PluginClass); internal plugin lifecycle hooks remain unchanged.
