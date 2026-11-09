# Narrator / Chrome: owner run, 2026-11-09

## Evidence

- [Original JSON, unchanged](manual-runs/2026-11-09-narrator-chrome-v1.json).
- Examiner: project owner. Windows 11, Chrome 157.0.8103.38, Windows Narrator,
  Russian speech; Narrator version and Windows build were not recorded.
- Source: `d3124bd794ec62ebe17af94f717f23013ba54a1f`, clean working tree,
  library 0.3.0-beta.1, Vue / ru-RU / oren.
- Owner marks: 36 steps completed, 26 passed, 10 failed. These are examiner
  observations, not 10 independently confirmed library defects.

## Triage and implementation

| Task                                          | Owner observations                                                                                              | Finding and response                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Select](https://app.clickup.com/t/869fpgat9) | Single-select arrows leave the control; multiple-select typing navigates the page and Escape does not close it. | A click without pointerdown does not move DOM focus into the field. The shared pointer plugin now focuses the field on click-only activation, without taking focus from nested buttons. Scan-mode interception remains a separate factor; protocol v2 explicitly requests scan mode off.                                                                                   |
| [Menu](https://app.clickup.com/t/869fpgatm)   | Opening announces a menu, but arrows lose its context; submenu activation does not enter its items.             | Click-only activation took the pointer path. The shared menu plugins now enter the first item for a click with detail=0, including submenus, and remember the submenu row for return. Physical pointer clicks retain their existing behavior.                                                                                                                              |
| [Toasts](https://app.clickup.com/t/869fpgau1) | Initial ordinary/loading messages are silent; urgent messages and later updates are heard.                      | A populated nested status live region is created with each ordinary message. Ordinary toasts now remain list items inside the pre-existing polite region; urgent alerts retain role=alert. DOM regressions cover both paths; audible behavior still needs a repeated Narrator run.                                                                                         |
| [Table](https://app.clickup.com/t/869fpgau6)  | Arrow navigation between cells was unsuccessful; sort directions were pronounced in English.                    | The example is a table, not an interactive grid. Protocol v2 supplies Narrator cell commands and distinguishes them from Tab navigation. The library already supplies standard aria-sort values and Russian button names. No independent table-model defect is established by these observations. The direction's spoken language remains an observation for the next run. |

A passed mark also needs to agree with the recorded observation. For example,
`select/choose` reports only opening the list, and `select-multiple/search`
reports an unselected option. Those entries do not independently establish
successful selection and should be repeated with the corrected instructions.

## Repeat protocol

Protocol v2 uses a separate draft key. The original JSON and v1 draft are not
rewritten or upgraded into passing results. Repeat Select, both Menu levels,
Table reading/sorting, and initial/update Toasts in Narrator + the same Chrome
build when available. Record scan-mode state and actual speech in notes.
If a key is still intercepted, mark the step unclear or failed and describe it;
do not infer a pass from the DOM.

- [Narrator scan mode](https://support.microsoft.com/en-us/accessibility/windows/narrator/chapter-3-using-scan-mode):
  Narrator + Space toggles scan mode; it can consume arrows and letter navigation.
- [Narrator table commands](https://support.microsoft.com/en-us/accessibility/windows/narrator/appendix-b-narrator-keyboard-commands-and-touch-gestures):
  Ctrl + Alt + arrows navigate cells.
- [WAI status-message technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22):
  the live-region container must exist before the status message.
- [ARIA sort](https://www.w3.org/TR/wai-aria-1.2/#aria-sort):
  ascending and descending are standard tokens, not translatable strings.

Automated checks of focus, keys and live-region structure are regression
evidence. They do not execute Narrator or prove audible announcements. All
fixes remain **awaiting manual retest**; this run says nothing about NVDA,
VoiceOver, other adapters, locales or platforms.
