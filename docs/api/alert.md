# Alert

Alert displays a message in the normal page flow. Its optional title, decorative icon,
content, action and dismissal icon are slots. It does not move focus, open a modal,
create a queue or expire automatically.

The default `role="alert"` is for urgent messages. Use `role="status"` for nonurgent
updates. Appearance does not select urgency: `variant` belongs to the theme; oren
provides `accent`, `positive`, `caution` and `negative`.

```vue
<script setup lang="ts">
import { Alert, Button, Icon, roleIcon } from '@soxa-ui/vue'

const warningIcon = roleIcon('warning')
</script>

<template>
  <Alert variant="caution" role="status" closable>
    <template #icon><Icon :tag="warningIcon" /></template>
    <template #title>Data is out of date</template>
    Refresh to see the latest changes.
    <template #action><Button type="button">Refresh</Button></template>
  </Alert>
</template>
```

Vue, React, Solid, Svelte and Web Components accept the native role override.
Angular preserves its existing root attribute precedence: apply an override using
the published `AttributesDirective`, imported by the consumer:

```html
<div so-alert [so-attributes]="{ role: 'status' }" closable>
  <span slot="title">Data is out of date</span>
  Refresh to see the latest changes.
</div>
```

In Angular, named content can be projected with `slot`; `close-icon` is a
`<ng-template slot="close-icon">`. React and Solid use named slot props,
Svelte uses named snippets, and Web Components uses light DOM `slot` attributes
on `<div is="so-alert">`.

`closable` defaults to false. The dismissal button calls the existing `hide()`;
cancel it with `hide:before` and `preventDefault()`. Call `show()` on the same
controller to restore the message and its retained content. Actions do not hide
the message automatically. The dismissal button always has `type="button"`.
Applications choose the type of their own action buttons.

The icon slot is decorative. Supply an existing Icon using a role such as
`info`, `success`, `warning` or `error`; keep meaningful information in the
text. The close button's accessible name follows the subtree locale. The optional
`alert.close` translation can be customized; older complete custom locales fall
back to their existing `modal.close` translation.

AlertDialog is a separate modal confirmation scenario. It is not part of Alert,
and Alert has no Toast dependency. DOM, browser and hydration checks do not
establish how every screen reader announces live-region updates.
