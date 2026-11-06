---
'@soldy-ui/plugins': minor
'@soldy-ui/setup': minor
'@soldy-ui/angular': minor
'@soldy-ui/vue': minor
'@soldy-ui/solid': minor
'@soldy-ui/svelte': minor
'@soldy-ui/react': minor
'@soldy-ui/webc': minor
---

Remove public plugin creation events. Replace namespace:create handlers with bundle:create and bundle.get(PluginClass); internal plugin lifecycle hooks remain unchanged.
