---
'@soxa-ui/angular': patch
---

README: the theme stylesheet goes into `src/styles.css` (`@import '@soxa-ui/theme-oren';`): Angular CLI puts CSS imported from `main.ts` into a chunk the page never loads.
