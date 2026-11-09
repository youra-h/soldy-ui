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

## Supported environments

| Area               | Status                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Browsers           | Current evergreen browsers; see the [support policy](README.md#supported-environments). Automated tests run in Chromium and WebKit; these tests do not certify every assistive-technology combination. |
| Framework adapters | Released components are available in all six adapters; see the [README](README.md#components).                                                                                                         |
| Screen readers     | An owner-run Narrator + Chrome check is recorded below. Fixes await manual retesting; this run does not cover other screen readers.                                                                    |
| Forced colors      | Supported by the `oren` theme and covered by browser tests.                                                                                                                                            |

## Known limitations

Soxa UI is in early development (`0.x`), and the following is known today:

- **No formal conformance claim.** The library has not been audited against WCAG, and makes no
  WCAG conformance claim. Conformance is a property of an application, but an audit of the library
  is still to come.
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
