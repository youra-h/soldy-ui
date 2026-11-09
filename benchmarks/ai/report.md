# AI и Soxa: результаты проверки Vue

Результаты ограничены этими первыми ответами, Vue и перечисленными сценариями. Неудачи сохранены наравне с успехами; общий вывод о любых AI компонентах из этой выборки не следует.

**Общее преимущество Soxa эта выборка не подтверждает.** У обоих AI-наборов прошли выполненные автоматические assertions для Select, DatePicker, Dialog и Tabs; у Table остались неудачи и пределы проверки. У Soxa записаны 18 passed и 27 failed наблюдений. Это N=1 первый ответ на модель/компонент; браузеры и режимы не увеличивают число независимых генераций.

В сохранённых состояниях есть 320 записей правил `axe.incomplete`: они требуют ручной проверки и не подтверждают прохождение соответствующих правил. Ручные NVDA/VoiceOver не выполнялись. Точные failed observations и ограничения времени перечислены ниже; timeout проверки не подменяет установленную причину дефекта компонента.

Основная матрица — [Linux CI 42600605491](runs/linux-ci-42600605491/integrity.json). Сопоставление локализованных заголовков и record Table исправлено [после наблюдения результатов](amendments/2026-11-09-table-public-matching.json); все 11 участников повторно проверены на неизменённых исходниках. Окончательный harness целиком не зарегистрирован до получения ответов.

**Целостность происхождения данных: valid.** Все 11 записей имеют общие commit, library state, OS, runtime/lock/harness hashes и согласованные наблюдённые версии браузеров. Это не означает отсутствие компонентных ошибок или прохождение ручных проверок.

[Протокол и ограничения](README.md), [версионированные данные](results.v1.json), [performance/memory отчёт](../validation/report.md).

Генерация: codex-cli-chatgpt-first-response, codex-cli 0.164.0-alpha.11.1. Exact prompts и неизменённые исходники — в [dataset](inputs/cli-2026-11-09-v1/dataset.json). Provider model/snapshot в CLI не раскрыт, configured model ID указан явно. CLI budget 12000 запрошен в prompt; hard cap не подтверждён. Generic tools объявлены, выполнения не наблюдалось. Это отдельный Codex first-response experiment.

| Компонент   | Soxa                          | gpt-6.1-sol (CLI selection; provider ID not exposed) | gpt-6-astra (CLI selection; provider ID not exposed) |
| ----------- | ----------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| select      | failed: 11, not-applicable: 1 | passed: 11, not-applicable: 1                        | passed: 11, not-applicable: 1                        |
| date-picker | failed: 8                     | passed: 8                                            | passed: 8                                            |
| dialog      | passed: 6, failed: 2          | passed: 8                                            | passed: 8                                            |
| tabs        | passed: 6, failed: 2          | passed: 8                                            | passed: 8                                            |
| table       | passed: 6, failed: 4          | failed: 10                                           | passed: 2, failed: 8                                 |

`passed` означает прохождение выполненных автоматических assertions, а не полную доступность. Записи `axe.incomplete` в raw требуют ручной проверки: отсутствие violations при incomplete не подтверждает прохождение соответствующего правила.

**Failed observations:**

- Soxa / chromium / select / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / select / rtl: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / select / narrow-touch: locator.waitFor: Timeout 10000ms exceeded. ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / select / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / select / ime: Unfinished IME Enter must not select an option ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / select / large: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / date-picker / default: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / date-picker / rtl: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / date-picker / narrow-touch: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / date-picker / reduce: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / dialog / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / tabs / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / table / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / chromium / table / large: page.goto: Timeout 10000ms exceeded. ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / select / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / select / rtl: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / select / narrow-touch: locator.waitFor: Timeout 10000ms exceeded. ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / select / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / select / large: Cell exceeded 120000 ms ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / date-picker / default: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / date-picker / rtl: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / date-picker / narrow-touch: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / date-picker / reduce: Escape must restore calendar trigger focus ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / dialog / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / tabs / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / table / reduce: Reduced-motion active animation exceeds 100ms in an observed state ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- Soxa / webkit / table / large: page.goto: Timeout 10000ms exceeded. ([raw](runs/linux-ci-42600605491/ci-soxa/results.json))
- model-1 / chromium / table / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / chromium / table / rtl: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / chromium / table / narrow-touch: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / chromium / table / reduce: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / chromium / table / large: Last logical record must remain reachable in the current sort direction ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / webkit / table / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / webkit / table / rtl: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / webkit / table / narrow-touch: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / webkit / table / reduce: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-1 / webkit / table / large: Last logical record must remain reachable in the current sort direction ([raw](runs/linux-ci-42600605491/ci-models/1-table/results.json))
- model-2 / chromium / table / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / chromium / table / narrow-touch: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / chromium / table / reduce: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / chromium / table / large: locator.ariaSnapshot: Timeout 10000ms exceeded. ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / webkit / table / default: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / webkit / table / narrow-touch: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / webkit / table / reduce: axe violations in recorded states ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))
- model-2 / webkit / table / large: Cell exceeded 120000 ms ([raw](runs/linux-ci-42600605491/ci-models/2-table/results.json))

Compile/runtime/invalid-input статусы смотрите в JSON рядом с точными исходниками и generation manifests; они не заменяются passed cells. Source baseline — commit библиотеки из экспорта и отдельный source hash SFC, будущий сайт потребляет опубликованные пакеты.

Ручные NVDA/VoiceOver: **not-run**. Accessibility tree и axe не подтверждают слышимые объявления. [Ручной протокол](manual-screen-reader.md). Reduced-motion выводы относятся только к наблюдаемым состояниям; годовые сочетания DatePicker и noneditable Select вне этого протокола.
Порог reduced-motion 100 ms — критерий протокола, включая color/focus-border transitions. Его превышение само по себе не доказывает WCAG motion violation или вестибулярную проблему.

Публичная SSG страница, переводы и опубликованный baseline остаются объёмом исходной задачи для дальнейшего этапа сайта. Деплой выполняется по отдельному запросу.
