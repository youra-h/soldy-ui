# Проверяемый отчёт о производительности

Объединяет собственные замеры [страниц](../pages/README.md), [действий](../interaction/README.md),
[Table](../table/README.md) и [SSR](../ssr/README.md) с исходными повторениями и проверкой полноты.
[Итоговый документ](report.md) предназначен для статей и будущей страницы сайта.
[Исторические данные других библиотек](historical.md) приводятся отдельно, без нового запуска.

## Матрица и единицы

| Замер         | Платформы                                          | Полный workload                                                                                                                           |
| ------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Страницы      | Vue, React, Angular, Svelte, Solid, Web Components | Все component pages из независимого реестра хостов; all/empty/leak; 50 копий, действия на 10, warm=2, cycles=20, rounds=3, settle=6000 ms |
| Долгая сессия | Все шесть одновременно                             | 30 минут, seed=7, every=50, settle=6000 ms; это общая нагрузочная memory session                                                          |
| Контроль soak | Все шесть одновременно, отдельно                   | Только planted leak, 1 минута, every=5, seed=7                                                                                            |
| Действия      | Все шесть последовательно                          | 50 копий, rates=1/4/6, warm=2, reps=10; counting build, N=1/50, count-reps=3                                                              |
| Table         | Все шесть последовательно                          | Только soxa+fit=none+width=3248+track, 5000×20, три повтора                                                                               |
| Virtual Table | Все шесть последовательно                          | Та же конфигурация +virtual, 10000×20, три повтора, прокрутка до конца и освобождение памяти                                              |
| SSR           | Первые пять последовательно                        | empty/all/leak, renders=3000, warm=600, every=150, leak-renders=600, leak-warm=150, settle=3000 ms; Web Components неприменим             |

Память страниц и SSR — bytes, в документе MiB/KiB. Table сохраняет существующую десятичную
единицу MB с округлением 0,1 MB. Ни JS heap, ни счётчики DOM/core не равны полной памяти процесса.
CPU throttling — эмуляция Chromium, не измерение конкретного телефона. Платформы с разными
наборами превью сравниваются только на совпадающих workload.

У [исходного `scrollThrough`](../../tools/bench-table/bench.ts) Virtual Table поля
отличаются от остальных действий: `paint` включает полный проход по экранам и финальное
успокоение, `settled` — только финальное успокоение. Reader report показывает их отдельно,
сохраняя исходные числа и не называя полный проход задержкой до первого кадра.

## Воспроизведение

Нужны Node из диапазона корня, зависимости lockfile и Chromium Playwright. Перед запуском
закрыть посторонние нагрузочные процессы; сборки, тесты и другие time benchmarks одновременно
с measured commands не выполнять. Все команды ниже запускаются из корня, кроме установки Table.

```powershell
npm.cmd install --no-audit --no-fund
npx.cmd playwright install chromium
npm.cmd run build:css --workspace=@soxa-ui/theme-oren
node tools/bench-pages/build.mjs
node --input-type=module -e "import {build} from 'vite'; await build({configFile:'tools/bench-pages/vite.config.ts',mode:'count'})"
node --input-type=module -e "import {build} from 'vite'; await build({configFile:'tools/bench-ssr/vite.config.ts'})"
```

Зависимости таблиц изолированы в собственном стенде; они не переносятся в root:

```powershell
Push-Location tools/bench-table
npm.cmd install --no-audit --no-fund
npm.cmd run build
Pop-Location
```

Сначала короткий smoke, затем полная матрица. Run ID уникален. Этапы можно запускать отдельно
с тем же ID; уже записанная команда не перезаписывается. Чужие участники runner не принимает:
имена и флаги Soxa задаются внутри, без входного списка библиотек.

```powershell
node tools/bench-validation/run.mjs 2026-11-09-smoke pages,soak,control,interaction,table,virtual,ssr --smoke
node tools/bench-validation/run.mjs 2026-11-09-full pages,soak,control,interaction,table,virtual,ssr
node tools/bench-validation/audit.mjs benchmarks/validation/runs/2026-11-09-full
node tools/bench-validation/report.mjs benchmarks/validation/runs/2026-11-09-full --journals
npm.cmd run test:bench-validation
```

Audit возвращает exit 1 при пропуске платформы/страницы/цикла/повтора, повреждённом JSON,
NaN/null в обязательном измерении, ошибках browser/scenario/SSR markup, неподтверждённом
planted leak или растущем empty control. `inp: null` и `renders/writes: null` обычной timing
build допустимы. Ошибка внутри успешного процесса не превращается в успешный отчёт. Сводка
различает полноту данных (`measured`, `failed`, `not-run`, `not-applicable`) и наблюдаемый рост.
Подставная утечка — положительный контроль прибора; её нельзя приписывать Soxa.

## Происхождение и сохранение

В `runs/<run-id>/` manifest содержит дату, commit, dirty-state, source/lock hashes,
Node/npm/runtime/browser versions, ОС/CPU/RAM, параметры и время каждой команды, exit code,
имена и hashes сохранённых raw. Source/build snapshots фиксируются отдельно для каждой
команды и не переписываются при продолжении этапов. `registry.json` отдельно получает
список страниц из скомпилированных хостов, а не из проверяемого результата.

Первый этап запуска от 2026-11-09 начал выполняться до добавления per-command snapshots.
Его начальные source/lock hashes сохранены, а отдельная датированная attestation проверяет
неизменность workload и hashes build с mtime раньше команд. Она прямо отмечает, что hashes
build получены после измерений; повторного запуска ради оформления метаданных не проводилось.

JSON сохраняется компактно, числовые значения не округляются дополнительным reporter.
Raw переносится сразу после команды до следующего запуска инструмента. Прежний рабочий
output инструмента удаляется до запуска, поэтому падение не архивирует старый результат.
Git не нормализует окончания строк в evidence папках: hashes должны переживать commit/checkout
на Windows с `core.autocrlf=true` и на Linux. Перед commit исходники AI сверяются также с index blobs.
Пароли, authorization headers, ключи API и heap dumps не сохраняются. `.txt` — stdout/stderr
собственных benchmark-команд без окружения процесса; это приложение к цифрам, а не основной отчёт.

Медиана нового отчёта для чётного N — среднее двух центральных чисел. Старые reporters
использовали верхний центральный элемент; исторические таблицы не пересчитываются.
Автоматический сигнал для страниц — осевший прирост хотя бы одного живого счётчика
не меньше половины измеренных циклов (10 объектов при 20 циклах); для JS heap — наклон
больше max(4096 bytes/цикл, утроенный модуль наклона empty). Для soak сигнал — положительный
прирост нижней границы любого счётчика либо наклон heap больше 4096 bytes/переход.
Это пороги диагностического сигнала, а не гарантия отсутствия меньшего удержания объектов.
Все исходные дельты сохранены независимо от порога; SSR использует отдельный
[исходный verdict](../../tools/bench-ssr/verdict.mjs).
Функциональный сбой, рост JS heap и воспроизводимая утечка — разные выводы. Рост счётчиков
проверяется повторным сценарием/soak replay до утверждения причины.
