# Breadcrumbs

Breadcrumbs shows an ordered navigation path. It uses the same collection engine,
item registration and activation extension as the other collection components.
The current page is the active item; mark the final item active for the usual
breadcrumb trail. Links and text-only locations are both supported.

```vue
<script setup lang="ts">
import { Breadcrumbs } from '@soxa-ui/vue'

const items = [
  { text: 'Home', href: '/' },
  { text: 'Catalog', href: '/catalog' },
  { text: 'Phones', href: '/catalog/phones' },
  { text: 'Smartphones', href: '/catalog/phones/smart' },
  { text: 'Current product', _: { active: true } },
]
</script>

<template>
  <Breadcrumbs :items="items" :maxItems="4" />
</template>
```

Use `Breadcrumbs.Item` to compose the path in markup:

```vue
<Breadcrumbs>
  <Breadcrumbs.Item text="Home" href="/" />
  <Breadcrumbs.Item text="Catalog" href="/catalog" />
  <Breadcrumbs.Item text="Current product" active />
</Breadcrumbs>
```

`items`, `engine` and `trackBy` follow the standard collection contract. Data is
turned into item instances by the collection factory; declarative items join on
mount and leave on teardown. An external engine can control membership, order
and activation. `active` belongs to the item facade and `_.active` to collection
metadata (write it as `_: { active: true }` in a data source). Activation is
exclusive and can be cancelled through `item:activate:before`. No active item
means no location receives `aria-current`; Breadcrumbs does not infer the current
route from a URL or from a link click.

`maxItems` defaults to 5 and counts the overflow button. When the trail is longer,
the first item, an overflow menu and the last `maxItems - 2` items remain visible.
Zero shows the entire trail. Positive finite values are rounded down and clamped
to at least 3; negative or nonfinite limits use 5. An exact fit has no overflow.
Collapsed ancestors remain members of the breadcrumb collection, retaining their
identity and activation. The menu represents those ancestors through its own
collection items.

The owner's item slots receive the item instance; its default content slot also
receives text and active state. Declarative Item slots customize that breadcrumb.
Overflow entries use the item's text and native link attributes; custom content
of a collapsed declarative Item is not moved into the menu.

Visible locations and hidden menu locations use native anchors. Browser
navigation, Enter, middle click, modifier click, `target`, `rel`, and
`preventDefault()` retain their native behavior. Hidden items without `href` are
unavailable menu items. The existing Menu supplies keyboard navigation and
closing behavior.

The root is a `nav` containing an `ol`; breadcrumb items are `li` elements. Only
the active location receives `aria-current="page"`. Decorative separators are
hidden from assistive technology. Names come from the nearest `LocaleProvider`;
`aria-labelledby` can name a specific trail. The optional
`translations.breadcrumbs` section contains `navigation` and `overflow`. Existing
custom locales without that section use English defaults; `extendLocale` accepts
a partial Breadcrumbs section.

All six adapters expose Breadcrumbs and its item part. Angular uses
`TBreadcrumbsComponent` and `TBreadcrumbsItemComponent`; Web Components supports
the `@soxa-ui/webc/breadcrumbs` entry. Oren supplies both the full stylesheet and
`@soxa-ui/theme-oren/breadcrumbs.css`.

The theme controls the separator and current/focus appearance. Shared geometry
uses `--so-breadcrumbs-gap` and `--so-breadcrumbs-separator-size`. Activation writes
the standard `data-selected` state used by themes.
