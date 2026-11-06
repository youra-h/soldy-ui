---
'@soldy-ui/core': minor
'@soldy-ui/setup': minor
'@soldy-ui/angular': minor
---

Remove duplicate `input`, `input:value`, `show:after`, and `hide:after` component events. Subscribe to `change:value` for value changes and to `show` or `hide` after the corresponding lifecycle hook. Angular consumers must replace `soInput` and `soInputValue` with `soChangeValue`, and `soShowAfter`/`soHideAfter` with `soShow`/`soHide`. The `open`, `close`, `element:ready`, `element:removed`, and `ready` events remain available.
