---
'@soxa-ui/theme-base': patch
'@soxa-ui/theme-oren': patch
'@soxa-ui/icons-lucide': patch
'@soxa-ui/icons-material': patch
---

Versioned on their own: a theme or an icon pack no longer shares the version of the library and depends on it by a range (`^` and a library version) instead of its exact version, so it keeps working with the library releases that do not break its contract. The icon packs take `@soxa-ui/setup` as a peer dependency now.
