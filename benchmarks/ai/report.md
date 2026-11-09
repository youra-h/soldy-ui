# AI и Soxa: результаты проверки Vue

Результаты ограничены этими первыми ответами, Vue и перечисленными сценариями. Неудачи сохранены наравне с успехами; общий вывод о любых AI компонентах из этой выборки не следует.

**Автоматическая матрица неполная.** Soxa: browser observations remain not-run; Expected 11 subject records, found 1. Это отдельный статус от качества компонентов.

[Протокол и ограничения](README.md), [версионированные данные](results.v1.json), [performance/memory отчёт](../validation/report.md).

Генерация: codex-cli-chatgpt-first-response, codex-cli 0.164.0-alpha.11.1. Exact prompts и неизменённые исходники — в [dataset](inputs/cli-2026-11-09-v1/dataset.json). Provider model/snapshot в CLI не раскрыт, configured model ID указан явно. CLI budget 12000 запрошен в prompt; hard cap не подтверждён. Generic tools объявлены, выполнения не наблюдалось. Это отдельный Codex first-response experiment.

| Компонент   | Soxa                 | gpt-6.1-sol (CLI selection; provider ID not exposed) | gpt-6-astra (CLI selection; provider ID not exposed) |
| ----------- | -------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| select      | failed: 6            | not-run                                              | not-run                                              |
| date-picker | failed: 4            | not-run                                              | not-run                                              |
| dialog      | passed: 3, failed: 1 | not-run                                              | not-run                                              |
| tabs        | passed: 3, failed: 1 | not-run                                              | not-run                                              |
| table       | passed: 4, failed: 1 | not-run                                              | not-run                                              |

**Failed observations:**

- Soxa / chromium / select / default: axe violations in recorded states
- Soxa / chromium / select / rtl: axe violations in recorded states
- Soxa / chromium / select / narrow-touch: locator.waitFor: Timeout 10000ms exceeded.
  Call log:
  [2m - waiting for getByRole('listbox') to be visible[22m

- Soxa / chromium / select / reduce: Reduced-motion active animation exceeds 100ms in an observed state
- Soxa / chromium / select / ime: Unfinished IME Enter must not select an option

* actual - expected

* [
* 'Alpha 1'
* ]

- []

- Soxa / chromium / select / large: axe violations in recorded states
- Soxa / chromium / date-picker / default: Escape must restore calendar trigger focus
- Soxa / chromium / date-picker / rtl: Escape must restore calendar trigger focus
- Soxa / chromium / date-picker / narrow-touch: Escape must restore calendar trigger focus
- Soxa / chromium / date-picker / reduce: Escape must restore calendar trigger focus
- Soxa / chromium / dialog / reduce: Reduced-motion active animation exceeds 100ms in an observed state
- Soxa / chromium / tabs / reduce: Reduced-motion active animation exceeds 100ms in an observed state
- Soxa / chromium / table / reduce: Reduced-motion active animation exceeds 100ms in an observed state

Compile/runtime/invalid-input статусы смотрите в JSON рядом с точными исходниками и generation manifests; они не заменяются passed cells. Source baseline — commit библиотеки из экспорта и отдельный source hash SFC, будущий сайт потребляет опубликованные пакеты.

Ручные NVDA/VoiceOver: **not-run**. Accessibility tree и axe не подтверждают слышимые объявления. [Ручной протокол](manual-screen-reader.md). Reduced-motion выводы относятся только к наблюдаемым состояниям; годовые сочетания DatePicker и noneditable Select вне этого протокола.
Порог reduced-motion 100 ms — критерий протокола, включая color/focus-border transitions. Его превышение само по себе не доказывает WCAG motion violation или вестибулярную проблему.

Публичная SSG страница, переводы и опубликованный baseline остаются объёмом исходной задачи для дальнейшего этапа сайта. Деплой выполняется по отдельному запросу.
