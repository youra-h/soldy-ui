---
'@soxa-ui/core': minor
'@soxa-ui/theme-base': minor
'@soxa-ui/theme-oren': minor
---

Replace boolean and state CSS modifiers with data attributes, including readonly, required, clearable, editable, closable, indeterminate and Tabs geometry readiness. Select now exposes open state only through data-open. Prefix orientation, DatePicker mode and Tabs alignment modifiers with their prop names.

Update custom themes: replace removed state modifiers with explicit selectors such as [data-required='true']; false remains the string "false". Replace --horizontal/--vertical with --orientation-horizontal/--orientation-vertical, --single/--range with --mode-single/--mode-range, and Tabs --center/--end/--stretch with --alignment-center/--alignment-end/--alignment-stretch. Replace the Tabs --ready-animation modifier with [data-ready-animation='true']. Native HTML attributes and component props retain their behavior.
