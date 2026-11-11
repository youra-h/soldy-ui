---
'@soxa-ui/setup': patch
'@soxa-ui/vue': patch
'@soxa-ui/react': patch
'@soxa-ui/solid': patch
'@soxa-ui/svelte': patch
'@soxa-ui/angular': patch
'@soxa-ui/webc': patch
'@soxa-ui/theme-base': patch
'@soxa-ui/theme-oren': patch
---

Prevent CodeBlock copy actions from covering source text, including horizontally scrolled lines. Show the copy icon by default and add the copy slot for custom button content across all adapters. Register the new copy role in both icon packs; update your icon pack or provide the copy slot when upgrading CodeBlock.
