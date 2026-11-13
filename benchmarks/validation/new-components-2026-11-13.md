# Аудит девяти компонентов — 13 ноября 2026

**Аудит выполнен; известный дефект Solid Breadcrumbs оставляет обычный тест и parity красными. Готовность стабильного выпуска не подтверждена.**

[Задача 1an4hvw5vua](https://app.clickup.com/t/1an4hvw5vua), [PR #861](https://github.com/youra-h/soxa-ui/pull/861). Scope: Alert, Badge, Breadcrumbs, Separator, ToggleButton, ToggleGroup, CodeBlock, Avatar, AlertDialog × 6 адаптеров; Avatar.Group отдельно.

Подтверждён [Solid Breadcrumbs focus defect](https://app.clickup.com/t/1an4hvw5wur): overflow закрывается по Escape, но фокус оказывается на BODY вместо текущего trigger. Обычный test остаётся FAIL, исправление продукта вынесено отдельно по указанию владельца. Публичное API и библиотечные реализации этим PR не меняются.

## Источники и метод

Исходный полный measured workload заморожен на e0c94a76c402a8c425c197768397384fd5a4c5af: `npm run bench:validate -- audit-new-components-20261113 pages,soak,control,interaction`, 09:06:06Z–10:55:57Z. [Manifest](runs/audit-new-components-20261113/manifest.json) содержит source/build hashes, версии и точные команды. [Strict summary](runs/audit-new-components-20261113/summary.json) сохраняет исходный FAIL pages/angular, 23/24 измеренных ячеек. Exit 0 процесса не подменяет проверку raw errors и полноты.

Пять адаптеров выполнили все 44 component pages + all/empty/leak + 3 tours. Angular измерил 42 страницы, включая все 10 целевых, затем остановился на неподдерживаемом harness prop direction у DragAndDrop. [Отдельный полный Angular recovery](runs/audit-new-components-20261113-supplement/pages-angular-command.json) на 62ee161f34db66c79771bcea4c8edfd97ecdbbd4, 11:20:22Z–12:08:54Z: все 47 страниц/служебных сценариев и 3 tours, strict findings 0. Empty без роста, planted leak обнаружен; tours: counters 0, heap −4308 B. Исходный FAIL сохранён, raw не копировался между прогонами.

Recovery пишет direction только целевым handle, проверяет Separator и убирает игнорируемый CodeBlock code рядом со snippets. Целевые действия и содержимое snippets сохранены, но это другая версия harness. Исходные CodeBlock measurements включали предупреждение о лишнем code. [Frozen preflight](runs/audit-new-components-20261113-preflight-final/page-update-preflight.json): 47 страниц/служебных сценариев × 6 mount→update→unmount, PASS, 0 errors/warnings.

Pages: n=50, act=10, warm=2, cycles=20, rounds=3, settle=6000 ms; шесть браузеров параллельно. Статические сценарии обновляют props всей партии из 50 копий; act=10 ограничивает индивидуальные интерактивные действия. Soak: все 6 одновременно, 30 минут после warmup, seed=7/every50/settle6000 ms. Control: все 6 одновременно, 1 min/every5/planted leak. Interaction: адаптеры последовательно, rates=1/4/6, warm=2, reps=10; counting N=1/50, count-reps=3. Сборки и functional tests не пересекались с исходными measured stages. Angular recovery шёл один; в начале параллельно выполнялись отдельные memory diagnostics. Его timings контекстные, межадаптерного ранжирования нет.

После замеров обычным merge включён main e1ba2a88c99fc48224c7bc7cb4b8cc3cdf2015d0. Frozen runtime/parity source — 0f9009fa76a8c9af15340f1e4a87d54ed834fad1. Main добавил внутреннюю защиту нативного CheckBox/Switch и 6 тестов вне целевых 9; публичные ready/removed сохраняются. Вклад самого аудита не меняет библиотечные реализации/API. Последующий test-only e37ecc83583be86fa2acf7f7edc2bda9213e17c3 ждёт actual Catalog→Phones→Catalog focus перед следующим key вместо прежнего раннего aria-expanded. Обычный Solid Escape assert сохранён. Измерения не переименованы в результаты нового SHA; окончательный delivery commit добавляет документы, evidence и ограничение English diff scan.

Mount/update/unmount включают второй RAF: это задержка до установившегося кадра, не чистый CPU. Вес — mounted−before JS heap; счётчики не равны памяти процесса. Чётная медиана усредняет два центральных значения. Сопоставимого historical baseline этих 9 нет; отсутствие regressions не заявляется.

## Матрица 54 сочетаний

P/F/S — фактически passed/failed/skipped functional cases Chromium; WebKit на указанном в proof index source SHA. Названия каждого теста, точные counts и JSON pointers по всем категориям находятся в последнем столбце. Axe — выполненные состояния C/W; это число не означает отсутствие moderate/incomplete. Soak complete/direct считает только полностью выполненные прямые переходы, all указан в index отдельно. Static interaction/keyboard N/A имеет причину в index.

| Компонент     | Host    | Functional C; W | Axe C/W | Memory               | Soak complete/direct | Interaction     | Manual                          | Parity | Proof key                                                                                |
| ------------- | ------- | --------------- | ------- | -------------------- | -------------------- | --------------- | ------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| alert         | vue     | 8P/0F; 8P/0F    | 1/1     | no growth detected   | 29/88                | 1 actions x3x10 | PASS                            | PASS   | [alert/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/0)              |
| alert         | react   | 6P/0F; 6P/0F    | 1/1     | no growth detected   | 31/90                | 1 actions x3x10 | PASS                            | PASS   | [alert/react](runs/audit-new-components-20261113/coverage-index.json#/rows/1)            |
| alert         | angular | 6P/0F; 6P/0F    | 1/1     | no growth detected   | 29/88                | 1 actions x3x10 | PASS                            | PASS   | [alert/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/2)          |
| alert         | svelte  | 6P/0F; 6P/0F    | 1/1     | no growth detected   | 27/86                | 1 actions x3x10 | PASS                            | PASS   | [alert/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/3)           |
| alert         | solid   | 6P/0F; 6P/0F    | 1/1     | no growth detected   | 29/88                | 1 actions x3x10 | PASS                            | PASS   | [alert/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/4)            |
| alert         | webc    | 6P/0F; 6P/0F    | 1/1     | no growth detected   | 29/88                | 1 actions x3x10 | PASS                            | PASS   | [alert/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/5)             |
| badge         | vue     | 10P/0F; 10P/0F  | 7/7     | no growth detected   | 29/78                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/6)              |
| badge         | react   | 7P/0F; 7P/0F    | 7/7     | no growth detected   | 29/79                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/react](runs/audit-new-components-20261113/coverage-index.json#/rows/7)            |
| badge         | angular | 7P/0F; 7P/0F    | 7/7     | no growth detected   | 29/78                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/8)          |
| badge         | svelte  | 7P/0F; 7P/0F    | 7/7     | no growth detected   | 28/75                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/9)           |
| badge         | solid   | 7P/0F; 7P/0F    | 7/7     | no growth detected   | 29/78                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/10)           |
| badge         | webc    | 7P/0F; 7P/0F    | 7/7     | no growth detected   | 29/78                | N/A             | N/A keyboard; observations PASS | PASS   | [badge/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/11)            |
| breadcrumbs   | vue     | 16P/0F; 16P/0F  | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | PASS                            | PASS   | [breadcrumbs/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/12)       |
| breadcrumbs   | react   | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | PASS                            | PASS   | [breadcrumbs/react](runs/audit-new-components-20261113/coverage-index.json#/rows/13)     |
| breadcrumbs   | angular | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | PASS                            | PASS   | [breadcrumbs/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/14)   |
| breadcrumbs   | svelte  | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | PASS                            | PASS   | [breadcrumbs/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/15)    |
| breadcrumbs   | solid   | 2P/1F; 2P/1F    | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | FAIL                            | FAIL   | [breadcrumbs/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/16)     |
| breadcrumbs   | webc    | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 17/66                | 2 actions x3x10 | PASS                            | PASS   | [breadcrumbs/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/17)      |
| separator     | vue     | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 32/83                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/18)         |
| separator     | react   | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 32/84                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/react](runs/audit-new-components-20261113/coverage-index.json#/rows/19)       |
| separator     | angular | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 32/82                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/20)     |
| separator     | svelte  | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 31/81                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/21)      |
| separator     | solid   | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 32/83                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/22)       |
| separator     | webc    | 4P/0F; 4P/0F    | 4/4     | no growth detected   | 32/83                | N/A             | N/A keyboard; observations PASS | PASS   | [separator/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/23)        |
| toggle-button | vue     | 5P/0F; 5P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/24)     |
| toggle-button | react   | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/react](runs/audit-new-components-20261113/coverage-index.json#/rows/25)   |
| toggle-button | angular | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/26) |
| toggle-button | svelte  | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/27)  |
| toggle-button | solid   | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/28)   |
| toggle-button | webc    | 3P/0F; 3P/0F    | 4/4     | no growth detected   | 16/86                | 2 actions x3x10 | PASS                            | PASS   | [toggle-button/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/29)    |
| toggle-group  | vue     | 30P/0F; 30P/0F  | 4/4     | no growth detected   | 6/84                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/30)      |
| toggle-group  | react   | 9P/0F; 9P/0F    | 4/4     | no growth detected   | 6/84                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/react](runs/audit-new-components-20261113/coverage-index.json#/rows/31)    |
| toggle-group  | angular | 9P/0F; 9P/0F    | 4/4     | no growth detected   | 6/84                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/32)  |
| toggle-group  | svelte  | 9P/0F; 9P/0F    | 4/4     | no growth detected   | 6/82                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/33)   |
| toggle-group  | solid   | 9P/0F; 9P/0F    | 4/4     | no growth detected   | 6/84                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/34)    |
| toggle-group  | webc    | 9P/0F; 9P/0F    | 4/4     | no growth detected   | 6/84                 | 2 actions x3x10 | PASS                            | PASS   | [toggle-group/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/35)     |
| code-block    | vue     | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/73                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/36)        |
| code-block    | react   | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/73                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/react](runs/audit-new-components-20261113/coverage-index.json#/rows/37)      |
| code-block    | angular | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/73                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/38)    |
| code-block    | svelte  | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/71                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/39)     |
| code-block    | solid   | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/73                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/40)      |
| code-block    | webc    | 15P/0F; 15P/0F  | 4/4     | no growth detected   | 6/73                 | 3 actions x3x10 | PASS                            | PASS   | [code-block/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/41)       |
| avatar        | vue     | 10P/0F; 10P/0F  | 4/4     | no growth detected   | 28/80                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/42)            |
| avatar        | react   | 10P/0F; 10P/0F  | 4/4     | no growth detected   | 28/80                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/react](runs/audit-new-components-20261113/coverage-index.json#/rows/43)          |
| avatar        | angular | 10P/0F; 10P/0F  | 4/4     | no growth detected   | 28/80                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/44)        |
| avatar        | svelte  | 10P/0F; 10P/0F  | 4/4     | no growth detected   | 27/79                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/45)         |
| avatar        | solid   | 10P/0F; 10P/0F  | 4/4     | no growth detected   | 28/80                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/46)          |
| avatar        | webc    | 10P/0F; 10P/0F  | 4/4     | SIGNAL native img/UA | 28/80                | N/A             | N/A keyboard; observations PASS | PASS   | [avatar/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/47)           |
| alert-dialog  | vue     | 11P/0F; 11P/0F  | 2/2     | no growth detected   | 4/95                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/vue](runs/audit-new-components-20261113/coverage-index.json#/rows/48)      |
| alert-dialog  | react   | 4P/0F; 4P/0F    | 2/2     | no growth detected   | 4/95                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/react](runs/audit-new-components-20261113/coverage-index.json#/rows/49)    |
| alert-dialog  | angular | 4P/0F; 4P/0F    | 2/2     | no growth detected   | 4/95                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/angular](runs/audit-new-components-20261113/coverage-index.json#/rows/50)  |
| alert-dialog  | svelte  | 4P/0F; 4P/0F    | 2/2     | no growth detected   | 4/94                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/svelte](runs/audit-new-components-20261113/coverage-index.json#/rows/51)   |
| alert-dialog  | solid   | 4P/0F; 4P/0F    | 2/2     | no growth detected   | 4/95                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/solid](runs/audit-new-components-20261113/coverage-index.json#/rows/52)    |
| alert-dialog  | webc    | 4P/0F; 4P/0F    | 2/2     | no growth detected   | 4/95                 | 4 actions x3x10 | PASS                            | PASS   | [alert-dialog/webc](runs/audit-new-components-20261113/coverage-index.json#/rows/53)     |

Avatar.Group — вспомогательная lifecycle/slot поверхность, не десятый самостоятельный компонент аудита.

| Host    | Functional C; W | Axe C/W | Cycles | Parity | Proof key                                                                                   |
| ------- | --------------- | ------- | ------ | ------ | ------------------------------------------------------------------------------------------- |
| vue     | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/vue](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/0)     |
| react   | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/react](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/1)   |
| angular | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/angular](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/2) |
| svelte  | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/svelte](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/3)  |
| solid   | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/solid](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/4)   |
| webc    | 7P/0F; 7P/0F    | 1/1     | 20     | PASS   | [avatar-group/webc](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/5)    |

Статические Badge, Avatar, Separator и Avatar.Group не имеют собственного keyboard interaction: проверены семантика, accessible name/роль там, где они предусмотрены, варианты и динамические props/slots. Ссылки на соседние Menu/Tabs cases не приписывают их целиком всем компонентам.

## Вес и lifecycle timings

Исходный e0c, включая завершённые Angular target cycles до сбоя нецелевого DragAndDrop. Каждый timing median[min–max], N20; KiB/копию=median(weight)/50/1024. No-growth означает отсутствие сигнала при данных порогах, не доказательство отсутствия любого удержания.

| Компонент     | Host    | Mount ms                     | Update ms                 | Unmount ms                | KiB/copy | Heap B/cycle | Δnodes/core/emitters/listeners | Actions/cycle |
| ------------- | ------- | ---------------------------- | ------------------------- | ------------------------- | -------- | ------------ | ------------------------------ | ------------- |
| alert         | vue     | 31.25 [25.70–33.30]; N=20    | 13.30 [11.80–17.40]; N=20 | 32.20 [30.90–33.20]; N=20 | 51.96    | 584.27       | 0/0/0/0                        | 10            |
| alert         | react   | 20.15 [16.30–24.70]; N=20    | 15.10 [11.80–24.80]; N=20 | 32.40 [30.90–33.30]; N=20 | 37.74    | 926.50       | 0/0/0/0                        | 10            |
| alert         | angular | 30.00 [24.30–36.70]; N=20    | 14.10 [8.60–18.60]; N=20  | 32.30 [30.90–33.20]; N=20 | 47.66    | 116.37       | 0/0/0/0                        | 10            |
| alert         | svelte  | 34.35 [29.10–40.30]; N=20    | 12.05 [8.50–20.50]; N=20  | 31.90 [31.00–33.20]; N=20 | 74.35    | 673.62       | 0/0/0/0                        | 10            |
| alert         | solid   | 23.20 [20.40–27.60]; N=20    | 14.70 [7.10–20.50]; N=20  | 32.15 [30.60–33.90]; N=20 | 65.12    | 466.94       | 0/0/0/0                        | 10            |
| alert         | webc    | 25.80 [23.00–32.00]; N=20    | 12.70 [6.70–17.50]; N=20  | 32.10 [30.80–34.10]; N=20 | 35.76    | 165.69       | 0/0/0/0                        | 10            |
| badge         | vue     | 9.80 [6.00–18.00]; N=20      | 7.70 [3.80–16.70]; N=20   | 32.10 [31.20–33.30]; N=20 | 10.24    | -491.42      | 0/0/0/0                        | 4             |
| badge         | react   | 7.65 [4.60–17.20]; N=20      | 15.25 [4.20–19.80]; N=20  | 32.25 [31.70–34.00]; N=20 | 7.59     | -397.33      | 0/0/0/0                        | 4             |
| badge         | angular | 8.55 [6.90–18.70]; N=20      | 6.90 [3.10–18.40]; N=20   | 32.10 [30.80–33.90]; N=20 | 11.34    | -213.49      | 0/0/0/0                        | 4             |
| badge         | svelte  | 8.95 [7.70–17.40]; N=20      | 12.25 [3.80–20.20]; N=20  | 32.25 [30.70–34.10]; N=20 | 17.15    | 145.64       | 0/0/0/0                        | 4             |
| badge         | solid   | 11.40 [5.00–18.30]; N=20     | 11.45 [2.90–20.40]; N=20  | 32.05 [30.70–34.30]; N=20 | 13.30    | -177.26      | 0/0/0/0                        | 4             |
| badge         | webc    | 9.55 [5.40–17.30]; N=20      | 13.05 [2.30–17.60]; N=20  | 32.45 [30.80–33.40]; N=20 | 7.71     | -113.88      | 0/0/0/0                        | 4             |
| breadcrumbs   | vue     | 105.10 [97.90–123.50]; N=20  | 12.00 [9.80–18.80]; N=20  | 32.10 [31.40–33.40]; N=20 | 230.34   | -398.56      | 0/0/0/0                        | 30            |
| breadcrumbs   | react   | 71.15 [61.20–81.30]; N=20    | 12.25 [9.90–21.50]; N=20  | 32.20 [30.30–33.50]; N=20 | 197.15   | -393.10      | 0/0/0/0                        | 30            |
| breadcrumbs   | angular | 130.70 [125.00–137.40]; N=20 | 12.35 [11.30–18.90]; N=20 | 31.95 [30.60–33.80]; N=20 | 304.71   | 256.74       | 0/0/0/0                        | 30            |
| breadcrumbs   | svelte  | 136.45 [123.40–142.00]; N=20 | 16.55 [14.20–24.30]; N=20 | 31.90 [30.20–33.90]; N=20 | 342.89   | 9.46         | 0/0/0/0                        | 30            |
| breadcrumbs   | solid   | 85.05 [75.80–96.90]; N=20    | 13.20 [11.10–21.10]; N=20 | 31.95 [30.90–32.70]; N=20 | 307.02   | 170.45       | 0/0/0/0                        | 30            |
| breadcrumbs   | webc    | 88.30 [80.60–100.80]; N=20   | 9.50 [7.80–17.20]; N=20   | 31.75 [30.50–32.80]; N=20 | 179.55   | 58.94        | 0/0/0/0                        | 30            |
| separator     | vue     | 11.25 [6.50–18.80]; N=20     | 9.80 [3.50–17.60]; N=20   | 32.45 [30.80–34.00]; N=20 | 8.68     | -70.74       | 0/0/0/0                        | 4             |
| separator     | react   | 11.00 [4.50–18.30]; N=20     | 13.45 [5.90–20.20]; N=20  | 32.15 [30.80–33.20]; N=20 | 6.49     | -177.85      | 0/0/0/0                        | 4             |
| separator     | angular | 8.80 [7.80–18.00]; N=20      | 10.00 [2.60–18.00]; N=20  | 32.45 [30.40–33.70]; N=20 | 8.94     | 59.11        | 0/0/0/0                        | 4             |
| separator     | svelte  | 11.55 [9.20–18.80]; N=20     | 15.65 [4.90–20.40]; N=20  | 32.10 [30.80–33.10]; N=20 | 14.14    | 51.35        | 0/0/0/0                        | 4             |
| separator     | solid   | 9.85 [5.40–18.00]; N=20      | 11.40 [3.70–20.30]; N=20  | 32.20 [31.00–33.00]; N=20 | 10.47    | 86.88        | 0/0/0/0                        | 4             |
| separator     | webc    | 8.75 [5.60–14.50]; N=20      | 10.90 [2.00–16.70]; N=20  | 32.15 [30.70–33.80]; N=20 | 6.28     | 47.19        | 0/0/0/0                        | 4             |
| toggle-button | vue     | 12.65 [7.50–17.30]; N=20     | 12.10 [3.60–18.30]; N=20  | 32.20 [30.90–34.10]; N=20 | 11.87    | -80.33       | 0/0/0/0                        | 20            |
| toggle-button | react   | 10.55 [5.40–17.70]; N=20     | 9.55 [4.30–20.10]; N=20   | 32.50 [31.00–33.30]; N=20 | 8.79     | -478.71      | 0/0/0/0                        | 20            |
| toggle-button | angular | 13.30 [8.80–17.10]; N=20     | 9.15 [3.10–18.80]; N=20   | 32.35 [30.50–33.50]; N=20 | 14.61    | -106.92      | 0/0/0/0                        | 20            |
| toggle-button | svelte  | 11.20 [8.90–18.90]; N=20     | 14.35 [5.00–19.20]; N=20  | 32.25 [30.70–33.00]; N=20 | 19.88    | 0.64         | 0/0/0/0                        | 20            |
| toggle-button | solid   | 12.05 [6.10–17.70]; N=20     | 12.00 [2.80–20.10]; N=20  | 31.95 [31.20–33.10]; N=20 | 15.39    | -34.31       | 0/0/0/0                        | 20            |
| toggle-button | webc    | 8.90 [6.00–18.20]; N=20      | 7.75 [2.30–18.60]; N=20   | 32.40 [30.90–34.10]; N=20 | 8.88     | 12.12        | 0/0/0/0                        | 20            |
| toggle-group  | vue     | 48.30 [44.50–68.20]; N=20    | 23.50 [21.10–33.40]; N=20 | 31.85 [30.80–33.40]; N=20 | 87.99    | -291.97      | 0/0/0/0                        | 40            |
| toggle-group  | react   | 34.05 [26.80–45.30]; N=20    | 26.75 [22.40–31.60]; N=20 | 32.20 [31.40–33.60]; N=20 | 72.36    | -425.52      | 0/0/0/0                        | 40            |
| toggle-group  | angular | 54.45 [50.30–65.10]; N=20    | 18.35 [16.10–20.00]; N=20 | 32.00 [30.40–33.90]; N=20 | 110.47   | -1335.56     | 0/0/0/0                        | 40            |
| toggle-group  | svelte  | 48.40 [44.90–58.20]; N=20    | 18.35 [16.60–23.90]; N=20 | 32.60 [31.40–33.10]; N=20 | 131.46   | -99.48       | 0/0/0/0                        | 40            |
| toggle-group  | solid   | 34.45 [32.00–52.40]; N=20    | 17.05 [15.30–23.30]; N=20 | 32.75 [30.90–33.90]; N=20 | 105.87   | -52.79       | 0/0/0/0                        | 40            |
| toggle-group  | webc    | 31.90 [27.40–46.80]; N=20    | 13.75 [11.20–20.70]; N=20 | 32.25 [30.80–33.20]; N=20 | 66.22    | -148.17      | 0/0/0/0                        | 40            |
| code-block    | vue     | 102.80 [87.80–113.30]; N=20  | 25.60 [22.30–30.40]; N=20 | 31.85 [30.70–33.50]; N=20 | 143.46   | 390.35       | 0/0/0/0                        | 30            |
| code-block    | react   | 74.40 [64.30–81.30]; N=20    | 29.65 [21.40–38.50]; N=20 | 32.35 [30.00–33.60]; N=20 | 123.48   | 461.33       | 0/0/0/0                        | 30            |
| code-block    | angular | 111.75 [102.00–129.20]; N=20 | 21.25 [19.70–26.30]; N=20 | 31.90 [30.80–33.90]; N=20 | 159.25   | 287.59       | 0/0/0/0                        | 30            |
| code-block    | svelte  | 111.35 [104.90–122.60]; N=20 | 23.65 [20.50–26.60]; N=20 | 32.35 [30.50–33.70]; N=20 | 211.60   | 466.64       | 0/0/0/0                        | 30            |
| code-block    | solid   | 80.15 [72.50–98.30]; N=20    | 31.55 [27.60–38.40]; N=20 | 32.60 [30.20–33.10]; N=20 | 204.98   | 563.35       | 0/0/0/0                        | 30            |
| code-block    | webc    | 89.70 [84.40–104.00]; N=20   | 19.15 [17.60–23.70]; N=20 | 32.30 [30.80–33.70]; N=20 | 119.43   | 137.33       | 0/0/0/0                        | 30            |
| avatar        | vue     | 9.65 [6.80–19.50]; N=20      | 10.00 [4.10–17.00]; N=20  | 32.55 [31.30–34.10]; N=20 | 10.76    | -663.24      | 0/0/0/0                        | 4             |
| avatar        | react   | 9.85 [5.80–17.70]; N=20      | 10.00 [3.70–19.60]; N=20  | 31.90 [30.70–33.20]; N=20 | 7.99     | 291.68       | 0/0/0/0                        | 4             |
| avatar        | angular | 10.70 [7.90–18.10]; N=20     | 7.90 [3.40–17.50]; N=20   | 32.20 [31.50–33.40]; N=20 | 12.80    | -5.89        | 0/0/0/0                        | 4             |
| avatar        | svelte  | 11.05 [9.40–16.50]; N=20     | 13.45 [4.60–20.80]; N=20  | 32.45 [30.90–33.80]; N=20 | 17.93    | 212.77       | 0/0/0/0                        | 4             |
| avatar        | solid   | 8.10 [6.10–16.70]; N=20      | 11.60 [3.30–19.80]; N=20  | 32.20 [30.60–33.70]; N=20 | 14.65    | 221.97       | 0/0/0/0                        | 4             |
| avatar        | webc    | 8.65 [6.20–18.90]; N=20      | 8.95 [2.80–17.30]; N=20   | 32.15 [30.90–33.40]; N=20 | 8.17     | 979.59       | 6000/0/0/0                     | 4             |
| alert-dialog  | vue     | 53.95 [49.20–58.30]; N=20    | 15.60 [13.10–17.90]; N=20 | 32.05 [30.80–33.10]; N=20 | 71.71    | 695.06       | 0/0/0/0                        | 40            |
| alert-dialog  | react   | 34.05 [25.70–39.80]; N=20    | 23.85 [12.60–31.40]; N=20 | 32.10 [30.40–34.00]; N=20 | 59.41    | 590.78       | 0/0/0/0                        | 40            |
| alert-dialog  | angular | 54.70 [47.60–95.20]; N=20    | 11.50 [5.30–18.20]; N=20  | 32.30 [25.80–33.50]; N=20 | 68.80    | 1226.36      | 0/0/0/0                        | 40            |
| alert-dialog  | svelte  | 64.85 [59.20–89.90]; N=20    | 13.20 [7.70–24.10]; N=20  | 31.35 [28.50–33.60]; N=20 | 109.79   | -2762.65     | 0/0/0/0                        | 40            |
| alert-dialog  | solid   | 36.00 [28.10–43.50]; N=20    | 10.55 [4.20–19.90]; N=20  | 32.40 [31.60–33.20]; N=20 | 96.26    | -309.47      | 0/0/0/0                        | 40            |
| alert-dialog  | webc    | 43.70 [39.80–48.30]; N=20    | 9.20 [2.20–16.50]; N=20   | 31.80 [30.40–33.00]; N=20 | 50.13    | -6.23        | 0/0/0/0                        | 40            |
| avatar-group  | vue     | 21.35 [19.10–25.50]; N=20    | 11.75 [7.70–17.10]; N=20  | 32.50 [31.80–33.20]; N=20 | 37.52    | -405.94      | 0/0/0/0                        | 2             |
| avatar-group  | react   | 15.30 [13.10–19.40]; N=20    | 14.65 [8.30–22.60]; N=20  | 32.45 [31.60–33.90]; N=20 | 28.34    | -182.35      | 0/0/0/0                        | 2             |
| avatar-group  | angular | 23.90 [21.60–28.10]; N=20    | 8.50 [7.20–18.90]; N=20   | 32.40 [30.20–34.10]; N=20 | 40.71    | -1150.73     | 0/0/0/0                        | 2             |
| avatar-group  | svelte  | 26.55 [23.60–33.70]; N=20    | 13.95 [8.00–20.20]; N=20  | 32.10 [30.80–34.10]; N=20 | 62.65    | -685.51      | 0/0/0/0                        | 2             |
| avatar-group  | solid   | 17.15 [14.90–19.10]; N=20    | 12.80 [6.90–20.10]; N=20  | 32.35 [30.30–33.50]; N=20 | 53.50    | -228.17      | 0/0/0/0                        | 2             |
| avatar-group  | webc    | 19.25 [17.10–21.50]; N=20    | 13.10 [5.80–18.70]; N=20  | 32.60 [31.00–33.90]; N=20 | 27.20    | -1441.87     | 0/0/0/0                        | 2             |

## Soak и положительный контроль

Все 6 сессий длились более 30 минут, errors=0/отсутствующих transitions=0. Floor — минимумы последних/первых 3 samples; transient last sample не равен leak. Planted leak обнаружен всеми 6.

| Host    | Soak min | Transitions | Floor Δnodes/core/emitters/listeners | Heap B/transition | Control min/transitions |
| ------- | -------- | ----------- | ------------------------------------ | ----------------- | ----------------------- |
| vue     | 30.07    | 3500        | 0/0/0/0                              | 252.82            | 1.07/40                 |
| react   | 30.08    | 3550        | 0/0/0/0                              | -0.90             | 1.06/40                 |
| angular | 30.11    | 3494        | 0/0/0/0                              | 28.86             | 1.09/40                 |
| svelte  | 30.01    | 3450        | 0/0/0/0                              | 16.12             | 1.07/40                 |
| solid   | 30.12    | 3527        | 0/0/0/0                              | 85.51             | 1.06/40                 |
| webc    | 30.12    | 3520        | 9780/0/0/0                           | 249.94            | 1.08/40                 |

Pages signal: counter growth>=10 за 20 cycles или heap slope>max(4096 B/cycle,3×abs(empty slope)). Soak signal: positive floor counter или heap slope>4096 B/transition. Все исходные delta сохранены. Strict validator 21/21 tests PASS, включая отсутствие target одновременно из compiled registry и raw, empty/planted leak controls, finite samples и resumed stages.

## Avatar: native image signal

Webc Avatar: +6000 DOM за 20 cycles, core/emitters/JS listeners=0; Webc soak floor +9780 DOM. [Matched controls](runs/audit-new-components-20261113-supplement/avatar-controls.json) повторили +6000 для exact scenario, native/Webc SVG/PNG и ожидания actual complete; manual variants loaded 50/50.

[Pure control](runs/audit-new-components-20261113-supplement/native-image-isolation.json): fresh browser/about:blank без app browser imports, 4 SVG/PNG/wait variants, +6000 DOM/+38092 B heap/0 listeners, core/emitters N/A; scripts=0, benchPresent=false, final document: 3 elements. Это исключает library/polyfill imports как необходимое условие сигнала.

[Strong retainer paths](runs/audit-new-components-20261113-supplement/image-retainers.json): actual Webc и pure native img→HTMLImageElement::ViewportChangeListener→MediaQueryMatcher→HTMLDocument→GC roots. UA alttext img удерживается через ShadowRoot img. +1000 исходных img, UA img, ShadowRoot, двух span и Text объясняют +6000. XMLDocument/SVG roots delta 0. Native signal остаётся SIGNAL в матрице; library memory PASS не объявляется.

Gzip before/end heaps фактического churn сохранены с SHA256; распаковать в .heapsnapshot для DevTools. Bounded traversal различает gc-root/no-recorded-strong-parent/bounded; выборка не равна полному доказательству для всего графа. [Seed 7 replay 115–115](runs/audit-new-components-20261113-supplement/replay-webc-115-115.json): 20 measured + 2 warm cycles, 15 copies/act=1, 0 errors, +1800 DOM/+22364 B heap, core/emitters/listeners 0. [Stock N→2N heap](runs/audit-new-components-20261113-supplement/heap-webc.json): 50→100, 17.22796875 KiB/copy total, JS 7.50625 KiB/copy. Это стоимость fallback mount, она не заменяет post-churn heap.

Для exact Webc before/end heap использованы отдельные CDP sessions: совпадение native node ID между ними не трактуется как доказанная идентичность. Pure control использует один CDP session; реальные типы/дельты и сильные цепочки подтверждают классификацию независимо от этого ограничения. Дополнительная задача диагностики Chromium пока остаётся локальным draft с ожидающим решением владельца; дефект исключительно адаптера этими данными не доказан.

## Interaction и изоляция

14 target actions × 3 rates × 10 reps × 6=2520 timed samples; counting14×2sizes×3×6=504. Neighbor DOM writes max 0. CodeBlock copy измеряет активацию; clipboard outcome доказан отдельными exact-copy/denial functional tests, не click count. INP — Event Timing sample стенда, не полевой показатель сайта.

| Host    | Component/action          | Paint ×1/×4/×6 ms | Settled ×6 ms               | INP ×6 ms                 | Update N1/N50 | Tick N1/N50 | Neighbor writes max |
| ------- | ------------------------- | ----------------- | --------------------------- | ------------------------- | ------------- | ----------- | ------------------- |
| vue     | alert/dismiss             | 16.00/19.00/22.50 | 64.00 [63.00–65.00]; N=10   | 24.00 [24.00–24.00]; N=10 | 3.00/3.00     | 0.00/0.00   | 0                   |
| vue     | breadcrumbs/open          | 16.00/18.00/22.50 | 64.00 [58.00–79.00]; N=10   | 24.00 [16.00–40.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| vue     | breadcrumbs/close         | 15.00/17.00/18.00 | 63.50 [60.00–82.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| vue     | toggle-button/press       | 15.00/14.50/15.00 | 64.00 [62.00–66.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| vue     | toggle-button/release     | 15.00/15.50/15.00 | 64.00 [62.00–65.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| vue     | toggle-group/choose first | 16.00/16.00/17.50 | 63.00 [59.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| vue     | toggle-group/clear first  | 16.00/16.00/18.00 | 63.00 [62.00–73.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| vue     | code-block/snippet two    | 16.00/18.00/32.50 | 80.50 [77.00–195.00]; N=10  | 32.00 [24.00–80.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| vue     | code-block/copy           | 16.00/19.00/39.00 | 113.50 [77.00–162.00]; N=10 | 28.00 [24.00–48.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| vue     | code-block/snippet one    | 17.00/28.00/54.50 | 98.50 [83.00–131.00]; N=10  | 56.00 [40.00–80.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| vue     | alert-dialog/open         | 16.00/16.00/20.00 | 63.50 [61.00–78.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| vue     | alert-dialog/close        | 15.00/15.50/17.00 | 64.00 [61.00–69.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| vue     | alert-dialog/cancel       | 15.00/16.00/19.00 | 66.00 [65.00–68.00]; N=10   | 16.00 [16.00–24.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| vue     | alert-dialog/confirm      | 16.00/15.50/20.00 | 66.00 [64.00–80.00]; N=10   | 16.00 [16.00–32.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| react   | alert/dismiss             | 16.00/20.50/23.50 | 63.00 [61.00–65.00]; N=10   | 24.00 [24.00–24.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| react   | breadcrumbs/open          | 16.50/19.00/36.50 | 82.50 [62.00–111.00]; N=10  | 32.00 [24.00–56.00]; N=10 | 14.00/14.00   | 0.00/0.00   | 0                   |
| react   | breadcrumbs/close         | 15.00/17.00/36.50 | 81.00 [63.00–89.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| react   | toggle-button/press       | 15.00/15.50/15.00 | 64.00 [60.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| react   | toggle-button/release     | 15.00/15.50/15.50 | 64.00 [62.00–66.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| react   | toggle-group/choose first | 16.00/17.00/18.00 | 63.00 [59.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| react   | toggle-group/clear first  | 15.50/17.00/17.00 | 62.50 [61.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 6.00/6.00     | 0.00/0.00   | 0                   |
| react   | code-block/snippet two    | 16.00/20.00/35.50 | 80.00 [78.00–94.00]; N=10   | 32.00 [32.00–40.00]; N=10 | 23.00/23.00   | 0.00/0.00   | 0                   |
| react   | code-block/copy           | 16.00/19.00/39.00 | 93.50 [91.00–127.00]; N=10  | 32.00 [24.00–32.00]; N=10 | 28.00/28.00   | 0.00/0.00   | 0                   |
| react   | code-block/snippet one    | 17.00/28.50/49.50 | 99.50 [98.00–136.00]; N=10  | 48.00 [48.00–64.00]; N=10 | 21.00/21.00   | 0.00/0.00   | 0                   |
| react   | alert-dialog/open         | 16.00/17.50/20.50 | 63.00 [62.00–78.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 18.00/18.00   | 0.00/0.00   | 0                   |
| react   | alert-dialog/close        | 15.00/16.00/16.50 | 63.00 [57.00–68.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| react   | alert-dialog/cancel       | 15.00/16.50/19.00 | 66.00 [63.00–68.00]; N=10   | 16.00 [16.00–24.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| react   | alert-dialog/confirm      | 16.00/16.50/22.00 | 66.00 [65.00–87.00]; N=10   | 24.00 [16.00–32.00]; N=10 | 11.00/11.00   | 0.00/0.00   | 0                   |
| angular | alert/dismiss             | 16.00/24.00/27.50 | 63.50 [62.00–80.00]; N=10   | 32.00 [32.00–40.00]; N=10 | 4.00/4.00     | 2.00/2.00   | 0                   |
| angular | breadcrumbs/open          | 17.00/21.50/27.00 | 63.50 [57.00–79.00]; N=10   | 24.00 [24.00–32.00]; N=10 | 8.00/8.00     | 2.00/2.00   | 0                   |
| angular | breadcrumbs/close         | 15.50/19.00/21.00 | 65.50 [62.00–72.00]; N=10   | 28.00 [24.00–32.00]; N=10 | 7.00/7.00     | 1.00/1.00   | 0                   |
| angular | toggle-button/press       | 15.00/16.00/17.00 | 64.00 [63.00–108.00]; N=10  | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 1.00/1.00   | 0                   |
| angular | toggle-button/release     | 15.00/17.00/17.00 | 64.00 [62.00–66.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 1.00/1.00   | 0                   |
| angular | toggle-group/choose first | 16.00/18.00/20.00 | 64.00 [61.00–89.00]; N=10   | 32.00 [24.00–40.00]; N=10 | 2.00/2.00     | 1.00/1.00   | 0                   |
| angular | toggle-group/clear first  | 16.00/18.00/20.00 | 63.00 [60.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 1.00/1.00   | 0                   |
| angular | code-block/snippet two    | 16.00/20.00/42.50 | 90.00 [79.00–118.00]; N=10  | 36.00 [32.00–48.00]; N=10 | 10.00/10.00   | 1.00/1.00   | 0                   |
| angular | code-block/copy           | 16.00/18.50/33.00 | 92.00 [75.00–162.00]; N=10  | 32.00 [24.00–64.00]; N=10 | 9.00/9.00     | 2.00/2.00   | 0                   |
| angular | code-block/snippet one    | 19.00/31.00/49.50 | 100.00 [99.00–119.00]; N=10 | 48.00 [48.00–64.00]; N=10 | 10.00/10.00   | 1.00/1.00   | 0                   |
| angular | alert-dialog/open         | 17.00/21.00/24.00 | 64.00 [60.00–76.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 5.00/5.00     | 2.00/2.00   | 0                   |
| angular | alert-dialog/close        | 15.50/18.50/20.00 | 63.00 [59.00–65.00]; N=10   | 28.00 [24.00–32.00]; N=10 | 4.00/4.00     | 1.00/1.00   | 0                   |
| angular | alert-dialog/cancel       | 16.00/20.50/23.00 | 66.00 [65.00–67.00]; N=10   | 24.00 [24.00–24.00]; N=10 | 5.00/5.00     | 1.00/1.00   | 0                   |
| angular | alert-dialog/confirm      | 17.00/20.00/25.00 | 67.00 [65.00–87.00]; N=10   | 24.00 [24.00–40.00]; N=10 | 5.00/5.00     | 1.00/1.00   | 0                   |
| svelte  | alert/dismiss             | 16.00/19.00/22.50 | 64.00 [62.00–77.00]; N=10   | 24.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| svelte  | breadcrumbs/open          | 16.00/18.50/25.00 | 67.50 [59.00–87.00]; N=10   | 24.00 [16.00–40.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| svelte  | breadcrumbs/close         | 15.00/17.00/19.00 | 63.00 [61.00–83.00]; N=10   | 28.00 [24.00–32.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| svelte  | toggle-button/press       | 15.50/15.00/14.50 | 64.00 [61.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| svelte  | toggle-button/release     | 16.00/15.00/14.00 | 63.00 [62.00–64.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| svelte  | toggle-group/choose first | 15.50/16.00/18.00 | 64.00 [62.00–65.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| svelte  | toggle-group/clear first  | 15.50/16.00/17.00 | 64.00 [62.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| svelte  | code-block/snippet two    | 15.50/20.00/34.50 | 81.00 [78.00–94.00]; N=10   | 32.00 [32.00–40.00]; N=10 | 4.00/4.00     | 0.00/0.00   | 0                   |
| svelte  | code-block/copy           | 16.00/16.50/36.50 | 79.50 [76.00–126.00]; N=10  | 24.00 [24.00–40.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| svelte  | code-block/snippet one    | 17.00/28.00/46.00 | 98.50 [84.00–101.00]; N=10  | 48.00 [48.00–56.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| svelte  | alert-dialog/open         | 15.00/16.00/17.00 | 64.00 [61.00–77.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 3.00/3.00     | 0.00/0.00   | 0                   |
| svelte  | alert-dialog/close        | 14.00/16.50/17.00 | 64.50 [60.00–79.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| svelte  | alert-dialog/cancel       | 15.00/16.00/17.50 | 66.00 [65.00–86.00]; N=10   | 16.00 [16.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| svelte  | alert-dialog/confirm      | 15.50/16.00/18.50 | 68.00 [64.00–70.00]; N=10   | 16.00 [16.00–24.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| solid   | alert/dismiss             | 17.00/19.50/22.00 | 64.00 [60.00–72.00]; N=10   | 24.00 [24.00–24.00]; N=10 | 1.00/1.00     | 0.00/0.00   | 0                   |
| solid   | breadcrumbs/open          | 16.00/18.00/22.00 | 62.00 [61.00–77.00]; N=10   | 32.00 [24.00–40.00]; N=10 | 4.00/4.00     | 0.00/0.00   | 0                   |
| solid   | breadcrumbs/close         | 15.00/18.00/21.00 | 64.00 [62.00–94.00]; N=10   | 24.00 [16.00–40.00]; N=10 | 4.00/4.00     | 0.00/0.00   | 0                   |
| solid   | toggle-button/press       | 15.00/16.00/15.00 | 64.00 [61.00–67.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| solid   | toggle-button/release     | 15.00/15.00/15.00 | 64.00 [62.00–66.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| solid   | toggle-group/choose first | 16.00/17.00/17.50 | 64.00 [60.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| solid   | toggle-group/clear first  | 16.00/16.00/17.50 | 64.00 [60.00–65.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 2.00/2.00     | 0.00/0.00   | 0                   |
| solid   | code-block/snippet two    | 15.50/17.00/31.00 | 80.50 [66.00–110.00]; N=10  | 32.00 [24.00–64.00]; N=10 | 8.00/8.00     | 0.00/0.00   | 0                   |
| solid   | code-block/copy           | 16.00/17.00/22.50 | 77.00 [75.00–110.00]; N=10  | 28.00 [24.00–48.00]; N=10 | 3.00/3.00     | 0.00/0.00   | 0                   |
| solid   | code-block/snippet one    | 17.00/27.00/45.50 | 94.50 [82.00–148.00]; N=10  | 48.00 [40.00–88.00]; N=10 | 9.00/9.00     | 0.00/0.00   | 0                   |
| solid   | alert-dialog/open         | 15.00/16.50/17.00 | 63.00 [61.00–64.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 4.00/4.00     | 0.00/0.00   | 0                   |
| solid   | alert-dialog/close        | 15.00/15.50/16.50 | 64.00 [62.00–67.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| solid   | alert-dialog/cancel       | 15.50/16.00/19.00 | 66.00 [64.00–83.00]; N=10   | 16.00 [16.00–40.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| solid   | alert-dialog/confirm      | 15.00/15.50/19.00 | 66.00 [65.00–66.00]; N=10   | 16.00 [16.00–24.00]; N=10 | 5.00/5.00     | 0.00/0.00   | 0                   |
| webc    | alert/dismiss             | 16.00/19.50/22.50 | 64.00 [63.00–77.00]; N=10   | 24.00 [24.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | breadcrumbs/open          | 17.00/18.50/23.50 | 67.00 [61.00–95.00]; N=10   | 24.00 [24.00–40.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | breadcrumbs/close         | 15.00/17.00/18.00 | 63.00 [61.00–87.00]; N=10   | 32.00 [24.00–40.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | toggle-button/press       | 15.00/15.00/15.00 | 64.00 [63.00–65.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | toggle-button/release     | 16.00/15.00/15.00 | 64.50 [63.00–127.00]; N=10  | 32.00 [24.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | toggle-group/choose first | 15.00/15.50/15.50 | 63.00 [63.00–64.00]; N=10   | 32.00 [32.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | toggle-group/clear first  | 15.00/15.00/17.00 | 64.00 [63.00–66.00]; N=10   | 32.00 [24.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | code-block/snippet two    | 16.00/17.00/31.00 | 80.00 [74.00–114.00]; N=10  | 32.00 [24.00–64.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | code-block/copy           | 16.00/17.00/24.00 | 77.00 [63.00–95.00]; N=10   | 24.00 [24.00–40.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | code-block/snippet one    | 17.00/27.00/44.50 | 84.00 [82.00–120.00]; N=10  | 48.00 [40.00–64.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | alert-dialog/open         | 15.00/16.00/20.00 | 62.00 [58.00–92.00]; N=10   | 32.00 [24.00–48.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | alert-dialog/close        | 15.00/15.50/16.00 | 63.50 [61.00–71.00]; N=10   | 24.00 [24.00–40.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | alert-dialog/cancel       | 15.00/16.00/18.00 | 66.00 [65.00–67.00]; N=10   | 16.00 [16.00–24.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |
| webc    | alert-dialog/confirm      | 15.00/16.00/18.00 | 66.50 [65.00–81.00]; N=10   | 16.00 [16.00–32.00]; N=10 | 0.00/0.00     | 0.00/0.00   | 0                   |

Все rate min/max/N, mount/update/tick counters и имена рендерившихся компонентов — в strict summary и interaction-<host>.json. Accounting адаптеров разный; числа не равны универсальному CPU.

## Functional, axe, manual и CI

Свежие полные C/W выполнены последовательно на frozen keyboard-test source e37; точные команды, run IDs, версии и исходные JSON связаны в [proof index](runs/audit-new-components-20261113/coverage-index.json). Chromium: 4414 PASS/1 FAIL. WebKit: 4317 PASS/1 FAIL/97 inherited capability skips; 4415 total на каждом. Единственный обычный FAIL — Solid Breadcrumbs возврат фокуса. Успех axe collection не превращает этот FAIL в PASS.

Новый audit suite: 96 cases, 95 PASS/1 Solid FAIL на каждом engine. ToggleButton — оба направления; ToggleGroup — single/multiple × orientation × direction, Home/End и disabled; AlertDialog — safe focus, trap, backdrop, choice, nested и 6 live locale updates. Ещё 6 самостоятельных Breadcrumbs restore cases после update/двух RAF и live aria-controls проверяют actual menu. Исходный focus case работает со свежим mount. Shared suite: 144 behavioral scenarios (24 × 6) + 6 inventory guards, все 150 PASS. Existing exact-copy/denial/removal, Avatar image/error/gradient/forced-colors и конкретные static cases перечислены по строкам в index.

Axe: 138 состояний на host × 6 = 828/828 reports на каждом engine, axe 4.14.0, Chromium 156.0.8078.4/WebKit 27.2. Full inventory: 52 записи = 44 direct + 7 consumer + 1 semantic-reference; semantic-reference не объявляется выполненным самостоятельным виджетом. Целевые 9 компонентов: 204 cases/engine; Avatar.Group: ещё 6. [Свежий target review](runs/audit-new-components-20261113/a11y-target-review-final.json) содержит все 420 исходных case pointers и dispositions; [первый e0c review](runs/audit-new-components-20261113/a11y-target-review.json) сохранён без перезаписи.

У целевых компонентов: 0 unresolved serious/critical violations и 0 waivers. При этом сохранены 12 moderate region cases/nodes (6 на engine: портальный Breadcrumbs menu вне navigation landmark) и 84 уникальных incomplete cases (42 на engine, 144 nodes суммарно). На каждом engine: color-contrast 24 cases/42 nodes; aria-valid-attr-value 12/12; label-content-name-mismatch 12/12; aria-hidden-focus 6/6. Cases с разными правилами пересекаются, поэтому rule counts не складываются в число уникальных cases. Incomplete остаётся needs-review, не PASS.

Dispositions: Breadcrumbs closed/open aria-controls реально разрешаются к текущей menu panel во всех 6 manual walkthrough; descriptive имя Show hidden breadcrumbs у видимого символа … записано, автоматический label-content pass не заявляется. AlertDialog background скрыт/inert, native Tab/Shift+Tab trap, safe focus и opener return проверены во всех 6. Moderate region сохранён как известная портальная/landmark особенность из ACCESSIBILITY. Новых blanket exceptions нет.

CodeBlock gutter: [12 numeric observations](runs/audit-new-components-20261113-supplement/chromium-contrast.txt), все 6 × 2 схемы: oren ratio 7.558072756271033, fg oklch(0.446 0.03 256.802), bg white; dark ratio 5.044798946134714, fg oklch(0.66 0.02 264.5), bg oklch(0.255 0.02 264.5), root/gutter opacity 1. Aria-hidden не использован как визуальное доказательство.

Avatar neutral named/error/fallback и group children/count: [96 captured states, 180 actual text nodes](runs/audit-new-components-20261113-supplement/avatar-contrast.json), все 6 × 2 схемы, minimum composed contrast 9.727313825592176. В raw сохранены text/state/foreground/background layers/opacity; loaded image без текста отмечен N/A. Existing variant/forced-color tests выполнены отдельно в полном C/W. Это ограниченные визуальные доказательства для перечисленных incomplete nodes, не глобальная WCAG/contrast сертификация. Full-registry inherited Toasts color-contrast exception [869fpjgvg](https://app.clickup.com/t/869fpjgvg) остаётся отдельно: 6 cases/12 serious nodes на engine, вне целевых 9.

[Manual keyboard](runs/audit-new-components-20261113/manual-keyboard-all-hosts.json): 35/36 interactive PASS, один Solid focus FAIL; 18 static semantics observations PASS, keyboard N/A. Все 6 Breadcrumbs closed/open refs разрешаются. Electron 43.8.6/Chromium 150 — дополнительное наблюдение. NVDA/VoiceOver/live speech недоступны, не проверялись; audible speech/AT conformance не заявляются.

Полный fresh [parity](runs/audit-new-components-20261113/parity/parity-report.md) на runtime 0f900: 44 pages, 191 Vue reference steps, 922 events. React/Svelte/Webc/Angular — 0 differences. Solid — 1 step на Breadcrumbs, Escape focus: Vue button vs Solid null; это тот же отдельный дефект 1an4hvw5wur. События/ARIA/focus сравнивались без новых исключений.

Remote history: [e0c](runs/audit-new-components-20261113/remote-ci.json) — 29 CI jobs + tooling = 30 PASS checks/2 browser FAIL, только известный Solid, прежние 4385 cases. [62ee](runs/audit-new-components-20261113-supplement/remote-ci.json) — 29 CI PASS/2 browser FAIL + tooling PASS; synthetic checkout bbb2134 включает новый main e1ba, фактически 4415 cases = 4385 + 24 audit + 6 main. Полный pre-main 4409 локально не выполнялся.

[0f900 CI](runs/audit-new-components-20261113-ci-merged/remote-ci.json) сохраняет дополнительную Angular WebKit harness readiness failure: Chromium 4414/1, WebKit 4316/2/97; ранний End отправлялся до initial menu focus. Targeted fix e37 и новые local/full remote результаты отделены от этого raw. Angular SSR attempt 1 упал на apt mirror timeout до установки продукта; адресный attempt 2 выполнил настоящий install/build smoke и PASS. Оба job logs сохранены; глобальный Actions outage не заявляется.

Финальный полный [remote CI e37](runs/audit-new-components-20261113-ci-readiness/remote-ci.json) выполнен: 29 CI jobs PASS + tooling PASS, два browser jobs FAIL исключительно из-за Solid Breadcrumbs Escape focus. Chromium: 4414 PASS/1 FAIL; WebKit: 4317 PASS/1 FAIL/97 inherited skips. Angular readiness теперь PASS. Synthetic checkout 457fc018df7193af9c6d0be53bd82091e8c40c83 = main e1ba + source e37; оба полных job logs и SHA256 сохранены. Последующий delivery commit содержит документы/evidence и bounded English scan; его CI проверяется live и фиксируется в PR без нового коммита только ради логов.

Сохранены неуспешные harness attempts: первоначальные 6 CodeBlock axe setup failures, CSS dist writer race, 6 precommit restore readiness failures и поздний Angular WebKit readiness race. Они не скрывают обычный Solid product FAIL и не приписываются продукту. [Evidence bundle](runs/audit-new-components-20261113/evidence-index.json) перечисляет raw files, версии, source phases и SHA256; optional native task draft в него не входит.

Для доставки raw исправлен English-comment guard: Git заранее ограничивает diff теми же 15 поддерживаемыми синтаксисами, вместо буферизации неподдерживаемых JSON. Парсер комментариев/added lines и rename exceptions сохранены. Regression check: root/nested/hidden paths, 1 MiB raw при 32 KiB diff budget, затем 31 запрещённый комментарий; все 4 English tests PASS. Это delivery tooling, не изменение runtime или измеренных сценариев.

Известный Solid focus дефект блокирует заявление о готовности стабильного выпуска. Product fix, выпуск и merge PR в аудит не входят.
