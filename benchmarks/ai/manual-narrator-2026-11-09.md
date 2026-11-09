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

| Task                                          | Owner observations                                                                                              | Finding and response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Select](https://app.clickup.com/t/869fpgat9) | Single-select arrows leave the control; multiple-select typing navigates the page and Escape does not close it. | A click without pointerdown does not move DOM focus into the field. The shared pointer plugin now focuses the field on click-only activation, without taking focus from nested buttons. A separate native-input regression dropped the first characters while opening/highlighting re-rendered the field before its value was saved. The shared input plugin now records text in the capture phase, before parent controls react. Scan-mode interception remains a separate factor; protocol v2 explicitly requests scan mode off. |
| [Menu](https://app.clickup.com/t/869fpgatm)   | Opening announces a menu, but arrows lose its context; submenu activation does not enter its items.             | Click-only activation took the pointer path. The shared menu plugins now enter the first item for a click with detail=0, including submenus, and remember the submenu row for return. Physical pointer clicks retain their existing behavior.                                                                                                                                                                                                                                                                                      |
| [Toasts](https://app.clickup.com/t/869fpgau1) | Initial ordinary/loading messages are silent; urgent messages and later updates are heard.                      | A populated nested status live region is created with each ordinary message. Ordinary toasts now remain list items inside the pre-existing polite region; urgent alerts retain role=alert. DOM regressions cover both paths; audible behavior still needs a repeated Narrator run.                                                                                                                                                                                                                                                 |
| [Table](https://app.clickup.com/t/869fpgau6)  | Arrow navigation between cells was unsuccessful; sort directions were pronounced in English.                    | The example is a table, not an interactive grid. Protocol v2 supplies Narrator cell commands and distinguishes them from Tab navigation. The library already supplies standard aria-sort values and Russian button names. No independent table-model defect is established by these observations. The direction's spoken language remains an observation for the next run.                                                                                                                                                         |

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

## Second owner run (protocol 2)

The immutable [second report](manual-runs/2026-11-09-narrator-chrome-v2.json)
was exported at 2026-11-09T16:49:24.903Z from clean commit
`013ca664cf305fb99c1b536984d4c1a975d9737e` (Windows 11, Chrome 157 user agent,
Windows Narrator, Russian speech, Vue / ru-RU / oren). Narrator/Windows build
numbers were not supplied. This is a partial repeat: 17 passed, 2 failed,
17 not run. Unrun steps do not erase the original observations.

- Single Select: all four steps passed. Multiple Select input, removal and
  navigation passed. The remaining failed step says only the most recently
  chosen option is spoken; the earlier selected value remains visible.
- Menu opening, submenu and Escape passed. Checkbox items are spoken as
  "не определено" in both visual states; the radio item is spoken as selected.
- Table: all four steps passed with the clarified commands.
- Toasts: ordinary insertion, urgent insertion and loading/result were marked
  passed. A note on the latter reports repeated "Сохраняем"; this is a remaining
  finding even though the step outcome is passed. Dismissal was not repeated.

### Response to remaining findings

The Select input is empty under multiple selection and had no description of
its selected tags. The shared ID plugin now connects the tag list through
`TAriaPlugin.parts`, preserving form and consumer descriptions. The selected
list's accessible name is the existing selection text, so a collapsed tag row
still describes all chosen values. Chromium's computed accessibility tree
reports the combobox description as `Первый, Второй`. This enables checking the
whole selection on return to the field; it does not force the screen reader
to repeat every selected value after each individual toggle.

Menu's DOM and Chromium accessibility tree expose the required checkbox state:
`Линейка` changes from checked=false to checked=true and back; `Сетка` retains
its separate state. The reported Narrator phrase remains unresolved. Neither
DOM nor Chromium's tree proves the Windows UIA value or what Narrator speaks.
Protocol 3 provides an ordinary HTML checkbox and an independent ARIA checkbox
menu item beside the fixture, so the owner can compare the same two states
without the Soxa implementation. Keep the finding open pending that comparison;
do not replace correct roles/states or claim a platform bug without evidence.
[WAI-ARIA menuitemcheckbox](https://www.w3.org/TR/wai-aria-1.2/#menuitemcheckbox)
requires `aria-checked` with true/false/mixed values.

The loading toast is inserted once and its text changes once to the result in
an observed DOM mutation trace. Its close button has a separate accessible
name containing the same message, and that name changes too. The close-control
subtree now has `aria-live=off` so its label updates are not additional status
messages; the button remains named and keyboard accessible. This is a targeted
mitigation of a possible duplicate source, not proof that all reported repeats
are fixed. The message text still inherits the pre-existing polite region.

Protocol 3 uses a separate draft key, visibly identifies this repeat and asks
for literal phrases on the three remaining findings. The original JSON files
stay unchanged. Audible effects of the new changes remain **awaiting manual
retest**. The previous PR commit `76160d35f` passed all 31 CI checks before this
second round of changes; that is not a result for the new implementation.
