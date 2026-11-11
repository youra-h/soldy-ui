# Accessibility

Soxa UI is a component library, so the accessibility of every application built with it starts
here. This page says what the library commits to, how that is checked, where it falls short today,
and how to report a barrier.

## Commitment

- **Patterns come from the
  [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/).** Roles, relations
  and keyboard models are taken from the APG pattern for the widget. Where a component departs from
  the pattern, the reason is written down next to the code.
- **ARIA is part of the model, not of the template.** Roles, states and accessible names are
  computed in the framework-agnostic core and plugins and rendered together with the markup, so
  they are present from the first render, server-side rendering included, and identical in every
  framework adapter.
- **Native first.** A native HTML attribute is used where the element has one (`disabled` on a
  `<button>`, `required` on an `<input>`); the ARIA equivalent is written only where it is not.
  The two are never set on the same element.
- **Every interactive component has an accessible name.** Visible names come from the `Label`
  component, which wraps its control. Names without visible text are set through `aria_label`,
  `aria_labelledBy` and `aria_describedBy`.
- **Accessibility and look are separate contracts.** Themes style `data-*` attributes and never
  `aria-*`, so fixing ARIA cannot break the visual design, and a theme cannot depend on it. A test
  in the theme package enforces this.
- **Motion follows the user.** Animations follow the operating system's `prefers-reduced-motion`
  setting by default. An application may force one mode for the whole library with `useMotion`.
- **The library's own strings are translatable.** Names of controls the library draws itself
  (close, clear, scroll, previous/next month and similar) come from a locale, set per subtree with
  `LocaleProvider`. Ready locales: `enUS`, `ruRU`, `zhCN`, `frFR`, `esES`, `arEG`.
- **Right-to-left layouts are supported.** Components follow the nearest `dir`, and the layout
  tests run in both directions.

## Patterns

| Component                 | APG pattern / role                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| Tabs                      | Tabs: arrow keys, Home/End, automatic activation, a single Tab stop |
| Accordion                 | Accordion                                                           |
| Select                    | Combobox (select-only and editable), with a listbox popup           |
| ListBox                   | Listbox                                                             |
| Tags                      | `list` without selection, Listbox with it; roving tabindex          |
| RadioGroup                | Radio Group, on native radio buttons                                |
| CheckBox, Switch          | Native checkbox input; Switch uses the `switch` role                |
| Slider                    | Slider and Multi-Thumb Slider                                       |
| Popover                   | Non-modal dialog at a trigger                                       |
| Tooltip                   | Tooltip, shown on hover and on keyboard focus                       |
| Dialog                    | Modal Dialog; Alert Dialog as a mode                                |
| Drawer                    | Modal Dialog at an edge of the screen or a container                |
| Calendar                  | Date grid from the Date Picker Dialog pattern                       |
| DateInput                 | Group of `spinbutton` segments                                      |
| DatePicker                | Date Picker Dialog                                                  |
| Table                     | Table, with sortable column headers and row selection               |
| ProgressLinear / -Spinner | `progressbar`                                                       |
| Skeleton                  | Decorative, hidden from assistive technology                        |

## How it is checked

- **Unit tests** check the ARIA each layer writes: roles, states, `id` relations and accessible
  names, for every component, in the core, the plugins and the adapters.
- **Server rendering tests** check that `id` relations rendered on the server match those after
  hydration.
- **Browser tests** run in real Chromium and WebKit (Playwright): keyboard activation, focus
  management in overlays, reduced motion and right-to-left layouts. Forced colors (Windows high
  contrast) repaint checks run in Chromium.
- Every change goes through these tests in CI.

## Automated axe audit

Recorded on 2026-11-10 with axe-core 4.14.0. Source:
`e293bcd93006296504b3befa852810f2e239d5f3 (clean)`. The reports record the actual commit and working-tree state;
`modified` means the task's changes were present but not yet committed during the run. A `clean` source identifies the code commit audited before this documentation-only update.

The mandatory desktop suite inventories **all 43 registry entries on all 6 hosts** (Vue, React, Svelte, Solid, Web Components, Angular): 110 named cases per adapter, 660 recorded case analyses
per browser, including 6 semantic-reference scans. The deliberately unnamed button in `gate/unnamed` is an expected negative control and is excluded from these 660 case totals. The inventory and fixture guards fail on missing components, hosts, suite entry
files or named fixtures; coverage is never reduced to the intersection of available previews.

| Engine   | Actual browser version | Case reports | Serious/critical nodes | Scoped exceptions | Incomplete nodes |
| -------- | ---------------------- | ------------ | ---------------------- | ----------------- | ---------------- |
| Chromium | 156.0.8078.4           | 660          | 30                     | 30                | 852              |
| WebKit   | 27.2                   | 660          | 30                     | 30                | 852              |

Both runs have zero **unresolved** serious/critical nodes and zero stale exceptions.
The retained violations listed below are still accessibility findings. **Color contrast has
not passed**; the theme does not make a new WCAG level or conformance commitment through this audit.

Coverage includes open/closed panels, Menu submenus and item panels, month/year Calendar pickers,
selected/unselected/disabled collections and controls, single/multiple selection, one/two Slider
thumbs, invalid fields with visible linked errors, empty/ordinary/error/loading Toasts and their
persistent live announcers, determinate/indeterminate Progress, and real Virtual windows over
ListBox, Select and Table. Each scan confirms its rendered consumer, role/parts and reached state
before axe and again after persisting the original result. The fixtures use the default oren light theme, LTR and the host's Russian locale;
these results do not certify other theme variants, locales, every keyboard path or an application.

The dispositions distinguish 35 application previews, 7 actual base consumer paths, and 1
headless base disposition that is not directly applicable to DOM axe. ComponentView, Stylable, Textable and
Control are exercised through Button; ValueControl and InputControl through Input; Frame through
an open Select panel, alongside real panel cases for Popover and DatePicker. Interactive is a
separate currently unused core branch, not an ancestor of Button: its named case is explicitly
**semantic-reference only**, using Button's interactive semantics, and does not claim execution
of the standalone TInteractive class or adapter. Every report carries direct/consumer/semantic-reference
coverage metadata. Decorative inheritance previews are not counted as actual consumer coverage.

### Breadcrumbs addition

The current mandatory inventory also includes Breadcrumbs: 44 registry entries and 114 named
cases per adapter. The 43-entry totals above remain the recorded baseline before this addition.
Breadcrumbs adds full, collapsed, open overflow and disabled-item cases. These 24 cases passed
on each engine across all six adapters, using source `8b5a02d6c` with the new inventory present
as working-tree changes. No serious/critical findings or scoped exceptions were added.
Each adapter retains one moderate `region` finding in the open overflow case because the
standard Menu teleports its panel outside the navigation landmark; incomplete checks remain
in the saved reports. This addition does not claim a complete audit of the other 110 cases.

### Findings and temporary exceptions

| Finding          | Reproduced scope                                                           | Remediation                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-contrast` | Error Toast title/description (3.75:1 and 3.49:1), each adapter and engine | [869fpjgvg](https://app.clickup.com/t/869fpjgvg): owner retained the existing Toast appearance on 2026-11-10; contrast remains an open finding |

On 2026-11-10 the owner approved keeping disabled Tabs panels readable while dimming only
the tab bar. The implementation passed the 108 disabled-state browser checks in each engine
(Chromium and Docker WebKit), covering both color schemes, and the targeted `tabs/disabled`
axe case in all six adapters in each engine. The 12 Tabs panel color-contrast exceptions were
removed. These focused results supersede that finding in the historical baseline above;
they do not constitute a new full-inventory audit. Toast styling and its exceptions remain
unchanged by the owner's decision.

On 2026-11-11, [869fpjhk9](https://app.clickup.com/t/869fpjhk9) resolved keyboard access
for overflowing disabled Tabs bars and Table viewports. A shared plugin measures scrollable
overflow on either axis and available inner Tab stops, then supplies the scrolling part's
attributes through the model. It adds a stop only when needed, preserves native disabled
controls and the existing Tabs/grid navigation, and updates after resize, content and
availability changes. The Tabs scroll surface remains operable in WebKit while its disabled
contents retain their pointer policy.

The focused validation passed 84 native keyboard/scroll regressions per engine across all
six adapters in Chromium and Docker WebKit: Tab/Shift+Tab, visible focus, real X/Y scrolling,
LTR/RTL, resize/content changes, enabled/disabled transitions, available/hidden/disabled inner
controls and grid navigation. All 12 task axe cases per engine passed, and only the 24 task
scroll-focus exceptions were removed. These focused checks do not replace the historical
full-inventory audit or the pending manual assistive-technology checks.

The exact browser/adapter/case/rule/node entries, reasons and tasks are checked into
[the exception inventory](packages/playground/vue/browser/axe/exceptions.ts). A node selector must
resolve to exactly one element and be identical to the element resolved from the original axe CSS
target. Generated mount ids are not hardcoded. Ambiguous, unmatched or stale exceptions fail;
new serious/critical findings fail regardless of WCAG or best-practice tags. No rule, including
contrast, is globally disabled. Negative controls verify unnamed/named buttons, exact node matching,
ambiguous/stale entries, missing reasons/tasks and complete incomplete-result persistence.

The audit also found invalid list semantics for urgent Toasts. The compatible fix keeps the
existing `li` as a list item and exposes `role="alert"` on its existing inner card through a shared
ARIA set in every adapter. Separate text-only announcers retain their priority and the card keeps
`aria-live="off"`. Audible Narrator behavior after this correction remains **pending manual retest**.
The recorded manual history below is preserved.

Other original violations remain visible and are not declared passed:

| Engine   | Rule     | Impact   | Adapter/case results | Nodes |
| -------- | -------- | -------- | -------------------- | ----- |
| chromium | `region` | moderate | 60                   | 162   |
| webkit   | `region` | moderate | 60                   | 162   |

Review `region` findings against the application's landmark structure, including non-modal teleported content; this fixture audit does not certify application landmarks.

### Incomplete checks and manual review

These are **needs-review results**, including findings with critical impact, not passes or waived violations. Adapter/case counts are analysis results; case names below are deduplicated across adapters. C/W means Chromium/WebKit.

| Rule                          | Adapter/case results (C/W) | Nodes (C/W) | Named cases                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-hidden-focus`           | 18 / 18                    | 18 / 18     | `date-picker/open`, `dialog/open`, `drawer/open`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `aria-valid-attr-value`       | 150 / 150                  | 198 / 198   | `calendar/disabled`, `calendar/grid`, `calendar/months`, `calendar/selected`, `calendar/years`, `date-picker/closed`, `date-picker/disabled`, `date-picker/invalid`, `date-picker/open`, `frame/select-panel-consumer`, `menu/closed`, `menu/item-panel`, `menu/open`, `menu/submenu`, `popover/closed`, `popover/open`, `select/closed`, `select/disabled`, `select/disabled-option`, `select/multiple-selected`, `select/open`, `select/single-selected`, `virtual/select-window-open`, `virtual/table-window`, `virtual/window` |
| `color-contrast`              | 18 / 18                    | 618 / 618   | `calendar/months`, `calendar/years`, `pagination/current-page`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `scrollable-region-focusable` | 18 / 18                    | 18 / 18     | `menu/item-panel`, `menu/open`, `menu/submenu`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Required manual checks at the original report nodes:

- **`aria-hidden-focus`**: Use real Tab/Shift+Tab while each listed modal or popup is open: confirm hidden background content is not tabbable and focus remains in the intended active surface. Retain the manual result for each original node.
- **`aria-valid-attr-value`**: Open each listed popup and inspect that every retained `aria-controls` reference resolves to its intended current panel; record both closed and open states. Axe reported popup relationships as needing review.
- **`color-contrast`**: Inspect the retained nodes in their actual visible state, check overlapping surfaces and measure foreground/background contrast using the original checks as evidence. These incomplete results do not pass contrast.
- **`scrollable-region-focusable`**: Reach each listed scroll region through its documented keyboard path and scroll its content without a pointer; check that a negative tabindex region can actually receive focus when required.

### Reports and reproduction

Axe runs in the test iframe document, including teleported panels and live regions, outside the
playground shell and Vitest UI. The document has a title, language, heading and main landmark.
Finite transitions must settle; infinite loading motion is left running. Cleanup checks layer
removal and scroll-lock restoration and restores document settings/focus.

Original `violations` and `incomplete`, with nodes, HTML, CSS targets, XPath and checks, are written
**before assertions**, together with case/state, engine/axe versions and source context. Classification
errors retain the original result with `gateError`; setup/state failures get a separate setup report.
The fixed output is `packages/playground/vue/.vitest/a11y/<browser>/<adapter>/<run-id>/`; each browser
has a manifest. A fresh run id prevents earlier failures from mixing into current totals. Moderate,
minor and incomplete results remain in these reports and require review; incomplete is not a pass.

Recorded run ids: Chromium `bfc3194c-3692-42d6-9910-43567b64667d`; WebKit `3142fd94-32f7-44ef-a86d-215591bc17f1`.
CI includes the suite in both desktop layout legs and always uploads the browser's reports as
`a11y-chromium` / `a11y-webkit`, including when the checks fail. The interactive scenario registry
is not executed by this suite. Historical benchmark/raw reports are unchanged.

```sh
npm run build:css --workspace=@soxa-ui/theme-oren
npm run test:browser --workspace=@soxa-ui/playground-vue -- browser/axe- --project "layout (chromium)"
npm run test:layout:webkit -- browser/axe- --project "layout (webkit)"
node packages/playground/vue/browser/axe/summary.mjs chromium latest
node packages/playground/vue/browser/axe/summary.mjs webkit latest
```

The Windows WebKit command uses the repository's Docker Playwright browser server, with the exact
installed Playwright version. On Linux, WebKit runs in the existing layout project directly.
Axe does not prove audible speech, physical-device behavior or WCAG conformance.

### CodeBlock addition

CodeBlock adds three named cases per adapter: basic source, numbered/highlighted lines,
and snippets backed by Tabs. All 18 additional cases passed the existing axe gate in
both Chromium and WebKit on the task branch. The 24 behavior scenarios per browser
cover keyboard activation/copying, source preservation, dynamic Tabs, scroll/wrap,
optional headers/actions, large sizing and clipboard failure feedback. These runs
extend the inventory; they do not replace the historical full-suite totals above.
See the [CodeBlock guide](docs/api/code-block.md) for semantics and the first-version scope.

## Supported environments

| Area               | Status                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Browsers           | Current evergreen browsers; see the [support policy](README.md#supported-environments). Automated tests run in Chromium and WebKit; these tests do not certify every assistive-technology combination. |
| Framework adapters | Released components are available in all six adapters; see the [README](README.md#components).                                                                                                         |
| Screen readers     | An owner-run Narrator + Chrome check is recorded below. Fixes await manual retesting; this run does not cover other screen readers.                                                                    |
| Forced colors      | Supported by the `oren` theme and covered by browser tests.                                                                                                                                            |

## Known limitations

Soxa UI is in early development (`0.x`), and the following is known today:

- **No formal conformance claim.** The regular axe fixture audit above is automated component coverage. The library has not undergone a comprehensive WCAG and assistive-technology audit, and these results do not establish application or library WCAG conformance.

- **No automated screen reader testing.** Behavior with NVDA, JAWS, VoiceOver and TalkBack is not
  checked in CI.
- **Screen-reader coverage is limited.** A recorded Narrator run covers Vue with a Russian locale on Windows 11. It does not establish behavior for other adapters, locales or screen readers.
- **Automated browser coverage has limits.** Firefox is not in the automated matrix. Chromium and WebKit tests check behavior and semantics, with engine-specific skips; they do not run a screen reader or replace testing Safari on a physical device.

## Recorded manual observations

On 2026-11-09 the project owner tested 36 steps using Windows Narrator and
Chrome 157.0.8103.38 on Windows 11, with Russian speech and the Vue adapter:
26 steps were marked passed and 10 failed. The Narrator version and Windows
build were not recorded. [Original observations and triage](benchmarks/ai/manual-narrator-2026-11-09.md)
retain the failed results, including ambiguous successful marks.

Follow-up fixes address click-only activation in Select and Menu and the
initial insertion of ordinary toasts into a live region. Protocol v2 supplies
explicit Narrator scan-mode and table-reading commands. These fixes have
automated regression coverage, but their audible results are **awaiting
manual retest**. No WCAG conformance claim follows from this run.

## Reporting a barrier

If something in Soxa UI keeps you from using an application, or keeps you from building an
accessible one, please tell us:

- open an issue with the
  [Accessibility barrier](https://github.com/youra-h/soxa-ui/issues/new?template=accessibility.yml)
  form. Say which component and adapter, what you expected, what happened, and which browser and
  assistive technology you use;
- if the problem should not be public, report it privately through
  [GitHub's private reporting form](https://github.com/youra-h/soxa-ui/security/advisories/new).

Accessibility barriers are treated as bugs, not as feature requests.

The owner's protocol-2 repeat recorded 17 passed steps, two failed and 17 not
repeated. Table reading/sorting and the initial toast announcements passed.
Remaining findings concern the description of all selected tags, Narrator's
checkbox-menu state, and repeated loading speech. Protocol 3 and its follow-up
changes are documented in the same [manual-run analysis](benchmarks/ai/manual-narrator-2026-11-09.md);
their audible effects await another manual check.

The protocol-3 owner repeat accepted the multiple-Select description and Menu
checkbox state. The remaining Toasts finding was excessive automatic speech:
list/card structure and close controls were read around the saving/result text.
Protocol 4 separates persistent text-only announcement regions from the named
interactive cards. Its actual Narrator speech remains awaiting owner retest;
see the [third-run analysis](benchmarks/ai/manual-narrator-2026-11-09.md#third-owner-run-protocol-3).
