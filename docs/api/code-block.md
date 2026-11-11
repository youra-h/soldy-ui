# CodeBlock

CodeBlock displays read-only source text with optional file titles, copy feedback,
syntax highlighting, logical line numbers, highlighted lines and snippets switched by Soxa Tabs.
It is available in all six adapters and preserves source characters, indentation,
blank lines and original line endings when copying.

## Single source and title

```vue
<script setup lang="ts">
import { CodeBlock } from '@soxa-ui/vue'

const code = 'const greeting = "Hello Soxa!";\nconsole.log(greeting);\n'
</script>

<template>
  <CodeBlock :code="code" />
  <CodeBlock :code="code" title="main.ts" language="ts" line-numbers />
  <CodeBlock :code="code" :highlight-lines="[2]" wrap :max-height="240" />
</template>
```

Omitting `title` creates no empty header. The copy button sits at the top of the
code area in the basic mode. A title can have an optional `title-icon` slot; use
the application's usual Soxa Icon or other decorative content there.

The code is text inside `pre > code`; HTML-like source never executes.
`lineNumbers` numbers logical lines, including empty ones. A wrapped line keeps
one number. The numbers are decorative, hidden from assistive technology and
excluded from the clipboard. `highlightLines` uses one-based logical positions;
invalid and out-of-range positions have no effect. A highlighted line has a
visual edge as well as a background.

Long lines scroll horizontally by default. `wrap` allows wrapping without
widening the page. `maxHeight` accepts pixels as a number or a CSS length such as
`'20rem'`; only the code scrolls, leaving the title and Tabs bar in place. The
labelled code region can receive keyboard focus and always has `dir="ltr"`,
including inside RTL content.

## Snippets and activation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CodeBlock } from '@soxa-ui/vue'
import type { ICodeSnippet } from '@soxa-ui/core'

const selected = ref('react')
const snippets: ICodeSnippet[] = [
  { value: 'vue', label: 'Vue', filename: 'App.vue', language: 'vue', code: '<h1>Vue</h1>\n' },
  {
    value: 'react',
    label: 'React',
    filename: 'App.tsx',
    language: 'tsx',
    code: '<h1>React</h1>\n',
  },
  {
    value: 'svelte',
    label: 'Svelte',
    filename: 'App.svelte',
    language: 'svelte',
    code: '<h1>Svelte</h1>\n',
  },
]
</script>

<template>
  <CodeBlock :snippets="snippets" v-model:value="selected" />
</template>
```

Omit `snippets` for the single-source mode. Supplying an array selects the Tabs
mode, including an empty array: no fragment is active and Copy is disabled.
`code` and nonempty `snippets` together produce a diagnostic; snippets takes
precedence. Duplicate snippet values are rejected before the collection changes.

The internal Tabs and its collection own activation. There is no second selected
index: `value` delegates to that activation and `change:value` reports it with
`{ oldValue, newValue }`, following normal Soxa model conventions. Seed `value`
or use a `TCodeBlock` instance to control activation; no separate `defaultValue`
prop is needed. With no requested value the first available snippet is active.
Unknown values leave the current activation intact. An empty initial value is a
valid string key if the corresponding snippet exists.

Replacing `snippets` patches items by `value`, preserving surviving instances.
Removing the active item activates the next surviving neighbour, then the
previous one if no next item remains. Tabs supplies ARIA relationships, focus,
arrow keys and Home/End. The strip scrolls instead of wrapping. Copy is outside
the tab list and copies the active source only. A snippet's `filename` appears beside the copy action in the same toolbar as the tabs,
unless the component has its own `title`; `highlightLines` on a snippet
overrides the component's list.

## Copy and localization

```vue
<CodeBlock
  :code="code"
  @copy="({ value, code }) => console.log('Copied', value, code)"
  @copy:error="({ error }) => console.error(error)"
/>
```

Copy uses the Clipboard API in the original user activation and reports success
only after the write completes. The event contains a snapshot of `value` and
`code` from the click. A rejected write or unavailable API emits `copy:error`
with the same snapshot plus `error`. HTTPS, permissions and browser policy still
apply. The UI reports the error through a polite live region and allows retrying;
it does not claim success or use a deprecated document-copy fallback.

The live status region announces a copied confirmation on success. Feedback resets when the
source or activation changes and when a new copy starts. `copyable=false` hides
the built-in button. Empty source and a pending copy disable the action.
Unmounting cancels feedback delivery from unfinished operations.

The nearest `LocaleProvider` supplies strings, including changes after mounting.
The optional `translations.codeBlock` section contains `region`, `copy`, `copied`
and `error`; older custom locales use English defaults. All six bundled locales
include these strings. The button shows the registered `copy` icon and keeps a
localized accessible name. Register the updated Material or Lucide pack with
`useIcons`, or provide the `copy` slot. This slot replaces only the button's
content; the built-in button still handles copying, disabled state and feedback.

Without a title or tabs, the button occupies its own row above the scroll region.
Custom content and long, horizontally scrolled lines cannot cover each other.

```vue
<script setup lang="ts">
import { CodeBlock, Icon, roleIcon } from '@soxa-ui/vue'

const copyIcon = roleIcon('copy')
</script>

<template>
  <CodeBlock code="console.log('Hello')">
    <template #copy>
      <span style="display: inline-flex; align-items: center; gap: 0.5em">
        <Icon :tag="copyIcon" /> Copy code
      </span>
    </template>
  </CodeBlock>
</template>
```

Use a `copy` node prop in React and Solid, a `copy` snippet in Svelte,
`<ng-template slot="copy">` in Angular (import `SlotDirective`), or
`<span slot="copy">` in Web Components. To keep visible text only,
provide `<template #copy>Copy</template>` in Vue or the equivalent slot
in another adapter.

## Syntax highlighting

`language` and each snippet's language produce normalized `data-language` metadata
on `code`. The names are `text`, `javascript`, `typescript`, `jsx`, `tsx`, `html`,
`css`, `json`, `bash`, `vue`, `svelte`, `python` and `yaml`; aliases `js`, `ts`,
`sh` and `yml` resolve to their full names, case-insensitively. Unknown languages
use `text` while preserving the complete source.

Syntax highlighting is built in using Lowlight (Highlight.js grammars), including server rendering.
Set `language="TypeScript"` or `language="ts"` for TypeScript. Vue and Svelte use
the markup grammar, including embedded script and style blocks. `text` disables
syntax colors. No highlighter setup or HTML strings are required: adapters render
only safe text segments. Multiline comments and strings retain their syntax across lines.

`value` selects the tab whose snippet has that key; it is unused without `snippets`.
For package-manager commands, omit filenames:

```vue
<CodeBlock
  :snippets="[
    { value: 'npm', label: 'npm', language: 'bash', code: 'npm install @soxa-ui/vue' },
    { value: 'yarn', label: 'yarn', language: 'bash', code: 'yarn add @soxa-ui/vue' },
    { value: 'pnpm', label: 'pnpm', language: 'bash', code: 'pnpm add @soxa-ui/vue' },
  ]"
/>
```

The tabs and Copy share one toolbar with no extra file-title row. `variant` is
inherited from the styling contract and selects the tab accent in Oren; it does
not control syntax colors or the block background.

## Other adapters

React, Solid and Svelte export `CodeBlock` and `CodeBlockProps`. Their usual Soxa
callback props handle `onChangeValue`, `onCopy` and `onCopyError`; the optional
icon slot keeps the name `title-icon`. Angular exports `TCodeBlockComponent` and
uses `<div so-code-block>` with `(soChangeValue)`, `(soCopy)` and `(soCopyError)`.
Web Components exports `TCodeBlockElement` from the root or
`@soxa-ui/webc/code-block`: `<div is="so-code-block">`. Set snippets and other
arrays as properties and listen for `so:change:value`, `so:copy` and
`so:copy:error`.

```tsx
import { CodeBlock } from '@soxa-ui/react'

;<CodeBlock code={'console.log("Hello");\n'} title="main.ts" language="ts" />
```

```ts
import '@soxa-ui/webc/code-block'
import { TCodeBlockElement } from '@soxa-ui/webc/code-block'

const block = document.createElement('div', { is: 'so-code-block' })
if (!(block instanceof TCodeBlockElement)) throw new Error('CodeBlock registration failed')

block.snippets = [{ value: 'shell', label: 'Shell', code: 'npm install\n', language: 'sh' }]
document.body.append(block)
```

## Theme contract

The full Oren stylesheet includes CodeBlock. Its separate entry is
`@soxa-ui/theme-oren/code-block.css`; that entry also includes its Button and Tabs
parts. Shared structure lives in theme-base; Oren supplies appearance in both
`oren` and `oren-dark` schemes. The existing Button/Tabs focus indicators remain
visible and the scroll region has its own focus ring.

Geometry defaults are declared on the document root and can be overridden on
`:root` or an ancestor: `--so-code-block-padding`, `--so-code-block-gap`,
`--so-code-block-font-family`, `--so-code-block-font-size`,
`--so-code-block-toolbar-font-size`,
`--so-code-block-line-height`, `--so-code-block-tab-size`, `--so-code-block-header-height-sm`,
`--so-code-block-header-height-normal`, `--so-code-block-header-height-lg`,
`--so-code-block-header-height-xl`, `--so-code-block-header-height-2xl`,
`--so-code-block-gutter-width`.
Oren adds `--so-code-block-background`, `--so-code-block-color`,
`--so-code-block-border-color`, `--so-code-block-muted-color`,
`--so-code-block-highlight-background` and `--so-code-block-radius`.

```css
.documentation-example {
  --so-code-block-padding: 1.25rem;
  --so-code-block-gutter-width: 5ch;
  --so-code-block-radius: 0.75rem;
}
```

The [generated API contract](generated/contract.json) supplies exact props, events,
defaults and per-adapter names. The published theme-base contract documents
`so-code-block`, its parts, states and variables. Examples and dynamic scenarios
are also available in the playground under CodeBlock.
