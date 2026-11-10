# Breadcrumbs

Breadcrumbs shows the ordered path to the current page. Supply a readonly array of
`{ text, href?, target?, rel? }` items. The final item is always the current page,
whether it has a link or only text. Ancestors without a link are also allowed.

```vue
<script setup lang="ts">
import { Breadcrumbs } from '@soxa-ui/vue'
const items = [
  { text: 'Home', href: '/' },
  { text: 'Catalog', href: '/catalog' },
  { text: 'Phones', href: '/catalog/phones' },
  { text: 'Smartphones', href: '/catalog/phones/smart' },
  { text: 'Current product' },
] as const
</script>

<template>
  <Breadcrumbs :items="items" :maxItems="4" />
</template>
```

`maxItems` defaults to 5 and counts the overflow button. When the trail is longer,
the first item, an overflow menu and the last `maxItems - 2` items remain visible.
Zero shows the entire trail. Positive finite values are rounded down and clamped
to at least 3; negative, nonfinite or invalid limits use 5. An exact fit has no
overflow.

The `item`, `item-leading` and `item-trailing` slots receive
`{ item, index, current }`. The index refers to the original complete array,
including in the overflow menu. Slots replace content inside the native link or
text wrapper. Keep their content noninteractive. Web Components follow their
existing static light-DOM sample-slot convention and do not deliver scope objects.

Visible locations and hidden menu locations use real anchors: browser navigation,
Enter, middle click, modifier click, `target`, `rel`, and `preventDefault()` keep
their native behavior. Hidden items without `href` are unavailable menu items.
The menu supports arrows, Home/End, typeahead, Escape and Tab. Updating items or the
limit closes an open menu. Focus stays with a surviving location, or moves to the
nearest available link, overflow button, or navigation landmark when none remain;
focus outside the component is left alone.

The root is a `nav` containing an `ol`. Only the final location has
`aria-current="page"`. Separators are decorative and hidden from assistive
technology. Names come from the nearest `LocaleProvider`; native
`aria-labelledby` can name a specific trail. The optional
`translations.breadcrumbs` section contains `navigation` and `overflow`.
Existing custom locales without that section use English defaults.
`extendLocale` accepts a partial Breadcrumbs section.

All six adapters export the component:

| Adapter        | Usage                                                          |
| -------------- | -------------------------------------------------------------- |
| Vue            | `<Breadcrumbs :items="items" />`                               |
| React, Solid   | `<Breadcrumbs items={items} />`                                |
| Svelte         | `<Breadcrumbs {items} />`                                      |
| Angular        | `<nav so-breadcrumbs [items]="items"></nav>`                   |
| Web Components | `<nav is="so-breadcrumbs"></nav>`, then assign `element.items` |

Angular apps import `TBreadcrumbsComponent` and the existing adapter providers.
Web Components can import `@soxa-ui/webc/breadcrumbs`. Oren supports both its full
stylesheet and `@soxa-ui/theme-oren/breadcrumbs.css`. The theme controls separators
and current/focus colors. The shared base exposes `--so-breadcrumbs-gap` and
`--so-breadcrumbs-separator-size`; current styling uses `data-current`.

The component has no router integration, automatic width measurement, collection
engine, compositional default slot, or public `Breadcrumbs.Item`.
