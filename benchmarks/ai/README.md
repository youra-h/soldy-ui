# AI и Soxa: зафиксированный протокол

Сравнение ограничено **Vue** и пятью компонентами: Select с поиском и multiple, DatePicker,
Dialog, Tabs и Table. [Текущий статус](report.md), [версионированный экспорт](results.v1.json),
[собственные benchmarks](../validation/report.md). Отсутствующий ответ или непройденная проверка
имеют явный статус `not-run`: инструмент и тестовые фикстуры не являются AI участниками.

## Генерация без подгонки

До генерации выбраны CLI model IDs `gpt-6.1-sol` и `gpt-6-astra`; provider model ID и
неизменяемый snapshot CLI не раскрывает. Слоты model-1/model-2 в экспорте связываются с
зафиксированными invocation и generation manifests, а не подменяют собой имена моделей.
Используется [один английский шаблон](../../tools/bench-ai/protocol.mjs), параметризованный
компонентом; точные тексты сохранены в [prompts/](prompts/), hashes — в экспорте. Требования,
runtime, requested budget 12000 output tokens, данные, локали, viewport и build одинаковы.

Один первый ответ на компонент/модель: всего 10. Direct Responses route отправляет только
prompt без репозитория, инструментов, поиска, истории и уточняющего диалога; на этой машине
его credential получил 401. Реальный эксперимент использует отдельный изолированный Codex CLI
route: пустой cwd/fresh home без проектной памяти и правил, обе CLI модели с medium reasoning.
Generic tool catalog у CLI остаётся объявлен, но попытка выполнения дисквалифицирует ответ.
CLI hard output cap не подтверждён: 12000 — общий requested budget, не доказанный hard limit.
Это Codex first-response experiment, не эквивалент direct Responses. Лимит Responses включает
reasoning и видимые tokens: одинаковый бюджет не означает одинаковую длину видимого кода.
Полный provider HTTP request CLI не экспортирует: сохранены exact prompt, invocation/settings,
raw events и hash локальной prompt-input preflight. Hash preflight не выдаётся за копию
непосредственного provider request. Один ответ на модель/компонент — N=1; разные сценарии
и браузеры не увеличивают число независимых генераций и не дают вероятность успеха модели.
Поле `actualModel` записывается как вернул провайдер; неизменность alias не предполагается.
Схема сверена по [официальной документации OpenAI](https://developers.openai.com/api/docs/guides/text)
и [описанию token budget](https://developers.openai.com/api/docs/guides/token-counting).

Prompt hashes заморожены до первого CLI запроса 2026-11-09 05:50:47 UTC.
[Хеши проверяющего harness](protocol.v1.json) записаны в 05:53:21 UTC: первый ответ уже
пришёл в 05:52:25, но исходники/ответы участников ещё не просматривались. Это фиксация
до просмотра результатов, а не заявление о регистрации всех файлов до начала генерации.
Первый registration не переписывается; необходимая починка harness получает dated amendment
с причиной, old/new hashes и симметричным повтором проверки всех неизменённых участников.
[Environment amendment](amendments/2026-11-09-environment.json), также до просмотра исходников,
закрыл возможность случайно импортировать лишние root dependencies: authored imports проверяются
до compiler transforms. Допускается Vue runtime и его публичные runtime подпути; внешние/вычисляемые
импорты, внешние SFC blocks и CSS `@import` дают `protocol-violation`. Образцы не исправляются.
Это контроль объявленного окружения, а не полный security sandbox Node или анализ любого `fetch`.
[Completion amendment](amendments/2026-11-09-completion-bounds.json) до просмотра исходников
зафиксировал одинаковые инфраструктурные пределы: действие 10 с, ячейка 120 с, процесс
участника 10 минут. Это предел завершения проверки, а не сравнительная оценка скорости.
[Public-role amendment](amendments/2026-11-09-public-roles.json) до просмотра исходников
допустил Table/Data Grid варианты с общими sort/select/large checks; grid требует одного
входа Tab и реального Down/Up перемещения active cell/row. Общая оболочка ждёт окончания
гидратации и два кадра после каждого reset: SSR-разметка сама по себе не означает готовые listeners.
[Observation amendment](amendments/2026-11-09-observations.json) до просмотра исходников
зафиксировал немедленные reduced-motion observations до axe и итоговую диагностику
неожиданных инфраструктурных ошибок с закрытием принадлежащих runner браузеров.
[Table-boundary amendment](amendments/2026-11-09-table-boundary.json) до просмотра исходников
убрал предположение о начальном направлении сортировки: последний логический record зависит
от текущего публичного `aria-sort`; после scrolling проверяется сохранение sort/select-all.
[Touch/observables amendment](amendments/2026-11-09-touch-and-observables.json) завершил
уже объявленный touch case в обоих движках и добавил проверки буквальных имён/контролов
из замороженного prompt. Критерии после этого заморожены; дальнейшая починка допустима
для конкретного runtime дефекта harness с сохранением диагностики и симметричным повтором.
[Форматирование](amendments/2026-11-09-format-only.json) и
[Vue lint metadata](amendments/2026-11-09-lint-metadata.json) зафиксированы отдельно.
Реальные диагностики обнаружили [инъекцию JSON после форматирования](amendments/2026-11-09-input-injection.json),
[пропущенный Vue SSR teleport context](amendments/2026-11-09-ssr-teleports.json) и
[селекторы/замер во время finite fade](amendments/2026-11-09-stable-observation.json).
Первые три Windows-прогона сохранены как диагностика harness и исключены из сравнительных выводов;
исходники участников не исправлялись. Axe снимается после конечных анимаций и двух стабильных
кадров; reduced-motion наблюдается отдельно сразу после действий. Стабильные нарушения остаются.
SSR snapshots хранятся как `.html.txt`: байты не меняются, у старых файлов есть archive index,
у новых — путь и SHA256 в cell. Это данные, не поддерживаемый HTML source; source comment guard не менялся.
Четыре крупных baseline Table snapshots по 52 MB сохранены только внутри исходных exact ZIP,
без дублирования expanded копий в Git. Исходный путь, ZIP entry, размер и SHA256 записаны
в [индексе основной матрицы](runs/linux-ci-42600605491/large-html-archive-index.json) и
[индексе предыдущей матрицы](runs/linux-ci-42595947092/large-html-archive-index.json).
Raw `results.json` не меняется. Для восстановления исходных путей распакуйте соответствующий
`observations.zip` в его run directory; остальные snapshots уже доступны отдельными файлами:

```powershell
Expand-Archive -LiteralPath benchmarks/ai/runs/linux-ci-42600605491/observations.zip -DestinationPath benchmarks/ai/runs/linux-ci-42600605491 -Force
```

```powershell
# Credential is read from the process environment and never printed or persisted.
node tools/bench-ai/generate.mjs benchmarks/ai/inputs/2026-11-09 MODEL_A MODEL_B
```

Использованный CLI route — [generate-cli.mjs](../../tools/bench-ai/generate-cli.mjs).
Первый аргумент — существующий абсолютный путь к Codex CLI, затем новый dataset и два
выбранных model ID. Dataset `cli-2026-11-09-v1` содержит запросы к `gpt-6.1-sol` и
`gpt-6-astra`, medium; версию/хеш клиента, invocation и launch settings он сохраняет явно.
[Проверка целостности](inputs/cli-2026-11-09-v1/integrity.json) подтверждает 10 неизменённых
ответов, по одному turn/candidate message, без наблюдавшихся tool executions. Исходник
генератора при запуске сохранён отдельно от последующих безопасных исправлений инструмента.
Временные копии авторизации и приватные рабочие каталоги после генерации удалены; в evidence
учётных данных нет. Владельческий профиль и auth-файл не менялись.

Перед сетью сохраняются точный prompt, request без headers и attempt manifest. После ответа —
raw HTTP response, exact text answer, returned model, дата/settings/usage и SHA-256. Исходник
извлекается без изменений из единственного fenced vue блока; полный ответ остаётся рядом.
Отсутствующий/некорректный блок и compile/runtime failures — результаты, не повод переписать код.
Не допускаются best-of, исправления после тестов или замена образца кодом агента с repo context.

При продолжении generator заполняет только никогда не запрошенные клетки. Существующие
attempts, включая failed/неполный ответ, не повторяются. Модели/протокол в dataset менять нельзя.
Нужда в повторной попытке после сетевого сбоя оформляется как новый явно описанный dataset,
с сохранением исходной неудачи; нельзя выдавать повтор за первый ответ.

## Одинаковое приложение и наблюдаемые проверки

[Production runner](../../tools/bench-ai/run.mjs) собирает один client и один SSR bundle через
один Vite/Vue runtime. Props/данные/язык/направление одинаковы на сервере и при гидратации.
Сторонний SFC вставляется как есть; общая оболочка даёт heading и соседние кнопки, без
исправления поведения участника. Soxa подключается отдельным [потребительским SFC](../../tools/bench-ai/Soxa.vue)
с публичными props/слотами; repo baseline отделён от будущего published сайта.

```powershell
npm.cmd run build:css --workspace=@soxa-ui/theme-oren
node tools/bench-ai/run.mjs soxa benchmarks/ai/runs/soxa-2026-11-09
node tools/bench-ai/run.mjs benchmarks/ai/inputs/2026-11-09/1-select/Candidate.vue benchmarks/ai/runs/model-1-select
node tools/bench-ai/batch.mjs benchmarks/ai/inputs/2026-11-09 benchmarks/ai/runs/models-2026-11-09
node tools/bench-ai/export.mjs benchmarks/ai/runs/soxa-2026-11-09/results.json benchmarks/ai/inputs/2026-11-09 benchmarks/ai/runs/models-2026-11-09
npm.cmd run test:bench-ai
```

Runner сверяет исходник с generation hash до компиляции. Пустой вход, compile-failed,
runtime-failed и behavioral failure различаются. SSR HTML каждого сценария сохраняется;
ошибки/предупреждения консоли и page errors не игнорируются. Запуски не перезаписываются.
Папки `inputs/` и `runs/` — неизменяемые данные эксперимента: общий ESLint и Prettier их не
исправляют. Ошибки синтаксиса/сборки остаются compile-failed, а runtime/console/axe/keyboard
проверки действуют одинаково для всех; исключение данных из линтера не даёт им passed status.

| Компонент         | Общий сценарий по роли/видимому поведению                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select            | Combobox name, ArrowDown, Home/End caret или допустимая popup boundary variant, настоящий active descendant или focus option, typed-prefix activation, multiple selection, search, Escape/focus; прокрутка к последней из 10000 options |
| DatePicker        | Открытие календаря, стрелка/Home/End, PageDown/PageUp месяц туда и обратно, выбор 15 ноября, видимый ISO output, Escape/focus                                                                                                           |
| Dialog            | Initial focus, Tab/Shift+Tab trap, Escape/возврат фокуса                                                                                                                                                                                |
| Tabs              | Roving tabstop, End/Home, ArrowRight (LTR)/ArrowLeft (RTL), activation, именованная панель                                                                                                                                              |
| Table / Data Grid | Видимый порядок при обеих сортировках, aria-sort, select-all; grid-only — один Tab entry и Down/Up focus/active-descendant; 10000 логических записей и достижимость последней прокруткой, включая virtual                               |

axe запускается на начальной, открытой и конечной разметке; нарушение initial axe не
отменяет поведенческий прогон. Дерево — `locator.ariaSnapshot()`, без устаревшего API.
`passed` означает прохождение выполненных assertions без записанных violations, а не
полную проверку доступности. Записи `axe.incomplete` в raw требуют ручной проверки:
отсутствие violations при incomplete не подтверждает прохождение соответствующего правила.
Эти записи сохраняются и не превращаются автоматически ни в passed rule, ни в failure.
Дополнительно: RTL/ar, 360px и реальное касание контрола через Playwright `locator.tap`
в touch context обоих движков; незавершённая IME-композиция и Enter, reduced-motion media.
Путь IME через CDP соответствует
[helpers test:layout](../../packages/playground/vue/vitest.browser.config.ts), ограничения движка —
[engine.ts](../../packages/playground/vue/browser/engine.ts).

На Windows Playwright WebKit не запускается; этот runner не подменяет его Chromium.
Полный browser-прогон выполняется на Linux CI с обоими движками. Только CDP IME в WebKit
остаётся `not-applicable`; touch проверяется. Ручные NVDA/VoiceOver — отдельно `not-run`
до реальной проверки. Механизм touch сверён по [Playwright Touchscreen](https://playwright.dev/docs/api/class-touchscreen)
и [emulation](https://playwright.dev/docs/emulation).

Текущее автоматическое покрытие — **подмножество APG**, не сертификация доступности:
typeahead проверяется в editable search режиме целевого Select; noneditable режим сюда не входит.
[APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) допускает для Home/End
нативный caret или optional переход к границе popup; проверка принимает оба варианта.
[APG Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) отличает composite с одним
входом Tab и управляемым фокусом от обычной таблицы; здесь проверены Down/Up и возврат,
без заявления о полном spreadsheet keyboard покрытии. Эти разделы APG прочитаны 2026-11-09.
DatePicker проверяет день и месяц, отдельные сочетания года вне этого протокола.
Reduced-motion проверяет активные анимации при наблюдении начального/открытого/итогового
состояния (не дольше 100 ms); завершённые и незапущенные анимации не покрыты.
Порог 100 ms — критерий этого протокола, включает color/focus-border transitions и сам
по себе не доказывает WCAG motion violation или вестибулярную проблему.
Эти ограничения выгружаются в JSON и не должны исчезать на сайте.
Реальные объявления screen reader требуют [ручного протокола](manual-screen-reader.md).

## Независимость проверки

Экспорт принимает counts только при совпадении source/prompt с generation manifest.
`invalid-input` никогда не показывает passed counts. Отдельная `comparisonValidity` сверяет
11 subjects по commit/library state, OS, runtime versions, lock/harness hashes и наблюдённым
browser versions. Смешанная среда даёт `invalid`, клетки исключаются из сводки;
неполная матрица остаётся `incomplete`. Исходные run files сохраняют диагностику.

Инструментальные тесты отличают missing input от compile/runtime failure, проверяют
неизменность первых ответов, resume, hashes и отсутствие credential в файлах.
Браузерные negative controls намеренно ломают End-клавишу Tabs и доступное имя кнопки:
те же проверяющие функции и axe должны обнаружить нарушения. Фикстуры помечены как
тестовые и никогда не попадают в AI результаты.

Linux CI проверяет инструмент/negative controls и запускает Soxa baseline и все 10 сохранённых
образцов в Chromium/WebKit с сохранением результатов. Ошибки компонентов остаются явными
findings; неполный или повреждённый результат роняет проверку инструмента. Raw-only commits
в уже открытом PR тоже могут запустить длительный job: `pull_request.paths` проверяет весь
трёхточечный diff PR, включая ранее добавленные инструменты, input dataset и lockfile.
Платные генерации и длительные performance benches вручную запускаются отдельно от CI.
Неуспех Soxa публикуется наравне с неуспехом AI. Будущая страница сайта получает этот export,
показывает источники/методику/пробелы и потребляет published пакеты; текущий PR сайт не меняет.

Основное сравнение — [полная Linux CI матрица 42600605491](runs/linux-ci-42600605491/integrity.json):
11 участников, Chromium и WebKit, одинаковое окружение и завершённые процессы. Первый Linux
запуск без baseline сохранён только как диагностика инструмента и в эту матрицу не входит.
Windows-прогоны также не смешиваются с Linux. [Execution completeness amendment](amendments/2026-11-09-execution-completeness.json)
сохраняет исходный exit, signal и timeout каждого процесса: даже записанные passed клетки
не принимаются при незавершённом процессе.

[Исправление сопоставления Table после наблюдения результатов](amendments/2026-11-09-table-public-matching.json)
принимает локализованные en/ru/ar заголовки и ищет точный текст record в ячейке, не его
порядковый номер в скрытой подписи checkbox. Эта правка выполнена **после просмотра результатов**;
полный окончательный harness нельзя считать зарегистрированным до ответов. Все 11 участников
повторно проверены симметрично, исходники и первые ответы не изменялись. Предыдущая полная
Linux матрица сохранена, но её затронутые выводы не используются в основном сравнении.

[Поправка кодировки поясняющих подписей](amendments/2026-11-09-unicode-display-erratum.json)
восстанавливает Unicode в отображаемом словаре первоначальной записи. Проверенный код
сопоставления, исходники участников, измерения и hashes при этой поправке не менялись.
