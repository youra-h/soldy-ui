# Исторические измерения других библиотек

Другие библиотеки в новом запуске **не запускались**. Ниже — опубликованные журналы,
зафиксированные на ревизии `71bcbaa01bf3ea83050168b833cb56d023ca38ec`, доступной на 2026-11-09.
Даты измерений — 2026-10-25 для Table и 2026-10-26 для страниц. Это контекст для статей,
а не современный сравнительный тест и не доказательство текущего дефекта чужой библиотеки.

## Table: чужие опубликованные числа

Общий workload старых журналов: продуктовая сборка, Chromium Playwright, окно 1600×1000,
5000 строк × 20 колонок, выбор/сортировка, без виртуализации; обычно медиана трёх повторов.
Время ниже — секунды до успокоения кадров, heap — MB исходного журнала. Точные CPU/ОС/RAM
и ревизия браузера в этих разделах не приведены: сопоставимость с новой машиной не доказана.

| Платформа      | Участник и версия из журнала   | Рендер, с | Heap после рендера | После снятия | Источник конкретной ревизии                                                                                                                           |
| -------------- | ------------------------------ | --------: | -----------------: | -----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vue            | Naive UI 2.45.3                |      2,37 |             412 MB |       6,3 MB | [Vue, 2026-10-25](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/vue.md#2026-10-25--vue-на-равных) |
| Vue            | PrimeVue 5.0.2                 |      22,7 |            2,77 GB |      2,26 GB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/vue.md)                             |
| React          | MUI 9.5                        |      1,64 |             277 MB |       3,5 MB | [React, 2026-10-25](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/react.md)                       |
| React          | Mantine 9.7                    |      1,74 |             166 MB |       3,5 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/react.md)                           |
| Angular        | Material 22.2                  |      1,63 |             104 MB |       1,9 MB | [Angular, 2026-10-25](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/angular.md)                   |
| Angular        | AG Grid 36.2                   |      2,68 |             359 MB |       2,4 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/angular.md)                         |
| Angular        | PrimeNG 22.1                   |      1,63 |             200 MB |       2,5 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/angular.md)                         |
| Angular        | NG-ZORRO 22.1                  |      1,76 |             227 MB |       2,2 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/angular.md)                         |
| Svelte         | Carbon Components Svelte 0.113 |      4,39 |             524 MB |       252 MB | [Svelte, 2026-10-25](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/svelte.md)                     |
| Svelte         | SvGrid 3.0                     |      4,87 |            1,22 GB |       1,4 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/svelte.md)                          |
| Web Components | Carbon 2.66                    |      8,31 |              79 MB |       0,8 MB | [Web Components, 2026-10-25](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/webc.md)               |
| Web Components | Spectrum 1.12                  |      2,17 |              70 MB |       0,4 MB | [тот же журнал](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/webc.md)                            |

В старом Solid журнале AG Grid с `ag-grid-solid` 31.1/AG Grid 36.2 дошёл до ошибки на замене
данных после одного повтора; это неполный результат, а не медиана трёх.
[Источник](https://github.com/youra-h/soxa-ui/blob/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/table/solid.md).
Ant Design, Vaadin и UI5 в соответствующих старых разделах имеют timeout/fail, их чисел здесь нет.

Оставшийся heap чужого компонента — наблюдение старого запуска. Слова старого журнала об
удержании не переносятся на текущую версию или нашу новую машину. В этих таблицах отсутствует
проведённая заново диагностика причин, поэтому новых утверждений «у X утечка» документ не делает.

## Страницы компонентов

[Сравнение от 2026-10-26](https://github.com/youra-h/soxa-ui/tree/71bcbaa01bf3ea83050168b833cb56d023ca38ec/benchmarks/compare)
содержит отдельные журналы Vue/React/Angular/Svelte/Solid/Web Components, точные матрицы
компонентов и настройки. Например, Vue 3.5.44: Naive 2.45.3, PrimeVue 5.0.2 + Aura 3.0.1,
Vuetify 4.3.0 и Reka 2.11.0, 50 копий, act=10, cycles=2+20. Reka там без темы и без Button/Input,
а другие участники с темами: общий рейтинг по весу некорректен. Сценарии и доступные части
не полностью совпадают (например, Tooltip hover/focus), это явно описано рядом с таблицами.

Исторические и свежие числа нельзя смешивать в процентах выигрыша: отличаются commit,
build, browser/runtime, доступные компоненты и неизвестны аппаратные условия старого запуска.
Для нового сопоставимого рейтинга потребовалось бы отдельно разрешённое и зафиксированное
общее измерение; текущая задача его для чужих библиотек не проводит.
