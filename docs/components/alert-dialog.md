# AlertDialog

AlertDialog asks the user to confirm an important action. It is always modal, uses
`role="alertdialog"`, takes its accessible name from `title` and its description from the
default slot. Dialog and its existing `alert` option remain available.

The default footer contains localized Cancel and Confirm buttons. Oren gives confirmation
a destructive color by its part context. Its action fill, hover and active colors use
`--so-alert-dialog-action-fill`, `--so-alert-dialog-action-hover` and
`--so-alert-dialog-action-active`: darker reds in the light scheme and the corresponding
readable reds in the dark scheme, retaining white text at a contrast ratio of at least 4.5:1. Supply `action` and `cancel` content slots for
application wording such as Delete or Keep. These slots retain the built-in Button and its
behavior; they do not replace the button itself.

## Vue

```vue
<AlertDialog v-model:visible="opened" @confirm="removeRecord">
  <template #title>{{ t('deleteTitle') }}</template>
  {{ t('deleteDescription') }}
  <template #action>{{ t('delete') }}</template>
</AlertDialog>
```

The `footer` slot replaces the whole action row, including with zero actions. Its scope
contains bound `confirm()` and `cancel()` commands:

```vue
<template #footer="{ confirm }">
  <Button type="button" @click="confirm()">{{ t('delete') }}</Button>
</template>
```

An explicitly empty `<template #footer />` removes both default actions and keeps the close
button. Omitting the slot restores the two default actions.

## Other adapters

React and Solid accept `action`/`cancel` content props and a `footer={({ confirm, cancel }) => ...}`
render function. React/Solid `footer={null}` is explicitly empty; `undefined` means omitted.
Svelte uses named snippets, including `{#snippet footer({ confirm, cancel })}...{/snippet}`;
an empty footer snippet removes the default actions.

Angular uses `<div so-alert-dialog>` with `[slot=title]`, `[slot=action]` and `[slot=cancel]`
projected content. Replace the row with `<ng-template slot="footer" let-confirm="confirm"
let-cancel="cancel">... </ng-template>` and import `SlotDirective`. An empty template removes
the default actions.

Web Components use `<div is="so-alert-dialog">` and named light-DOM slots. A supplied empty
`<span slot="footer"></span>` removes the default actions. DOM slots have no function scope:
custom button listeners call `element.ctrl.confirm()` or `element.ctrl.cancel()`.

## Choice and closure

Confirming emits `confirm`; cancellation emits `cancel`. The application performs the actual
operation. Both events receive `TActionEvent`: calling `preventDefault()` synchronously keeps
the dialog open, for example while awaiting an async operation. After success set `visible=false`;
a rejected operation can leave it open for retry. Event callback names are `onConfirm/onCancel`
in React, Solid and Svelte, `soConfirm/soCancel` in Angular, and `so:confirm/so:cancel` DOM events
whose `detail` is the same cancellable event in Web Components.

By default a choice requests closing through `close:before`, which can separately veto it.
Escape and the close button cancel. `dismissible=false` disables Escape; `closable=false`
removes the close button. Pressing the backdrop never closes or confirms. Programmatic
`visible=false` emits no choice.

Focus starts on the default Cancel button. With a custom footer, or an unavailable default
Cancel button, it starts on the panel. Tab stays inside; closing returns focus to the opener.
Provide a meaningful title and a concise description. Standard labels follow LocaleProvider;
old complete custom locales without `translations.alertDialog` receive English fallback labels.
