# Отклик на действие — Angular

Стенд и методика — [`README.md`](README.md), итоги всех платформ — [`report.md`](report.md).

## 2026-10-28 — Angular, первый замер

Отклик, мс (медиана):

| Действие                | ×1, кадр | ×4, кадр | ×6, кадр | ×6, успокоение | ×6, INP |
| ----------------------- | -------- | -------- | -------- | -------------- | ------- |
| select: open            | 17       | 25       | 31       | 80             | 32      |
| select: close           | 16       | 20       | 23       | 63             | 24      |
| select: type            | 10       | 14       | 23       | 60             | 24      |
| menu: open              | 17       | 23       | 30       | 77             | 32      |
| menu: close             | 16       | 20       | 23       | 66             | 32      |
| date-picker: open       | 18       | 27       | 37       | 81             | 32      |
| date-picker: close      | 16       | 21       | 25       | 64             | 24      |
| date-picker: locale ru  | 19       | 64       | 101      | 144            | —       |
| date-picker: locale en  | 19       | 54       | 91       | 131            | —       |
| dialog: open            | 17       | 23       | 26       | 65             | 32      |
| dialog: close           | 16       | 19       | 21       | 63             | 24      |
| input: type             | 14       | 14       | 15       | 61             | 16      |
| tabs: tab 2             | 17       | 22       | 40       | 84             | 32      |
| tabs: tab 1             | 17       | 23       | 47       | 96             | 32      |
| calendar: locale ru     | 122      | 693      | 1140     | 1180           | —       |
| calendar: locale en     | 119      | 685      | 1137     | 1177           | —       |
| number-input: locale ru | 17       | 23       | 28       | 66             | —       |
| number-input: locale en | 17       | 23       | 29       | 66             | —       |

Работа на действие (медиана):

| Действие                | обновлений, 50 копий | обновлений, 1 копия | монтирований, 50 / 1 | DOM-записей в других копиях | DOM-записей вне страницы, 50 / 1 | кто обновился (50 копий)                                                                  |
| ----------------------- | -------------------- | ------------------- | -------------------- | --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| select: open            | 3 (тактов 1)         | 3                   | 0 / 0                | 0                           | 4 / 4                            | TSelectComponent 1, TInputComponent 1, TFrameComponent 1                                  |
| select: close           | 3 (тактов 1)         | 3                   | 0 / 0                | 0                           | 2 / 2                            | TSelectComponent 1, TInputComponent 1, TFrameComponent 1                                  |
| select: type            | 5 (тактов 1)         | 5                   | 0 / 0                | 0                           | 6 / 6                            | TSelectComponent 1, TInputComponent 1, TSelectItemComponent 1, TItemRowComponent 1        |
| menu: open              | 4 (тактов 2)         | 4                   | 0 / 0                | 0                           | 4 / 4                            | TButtonComponent 2, TMenuComponent 1, TFrameComponent 1                                   |
| menu: close             | 3 (тактов 1)         | 3                   | 0 / 0                | 0                           | 2 / 2                            | TMenuComponent 1, TButtonComponent 1, TFrameComponent 1                                   |
| date-picker: open       | 8 (тактов 2)         | 8                   | 0 / 0                | 0                           | 54 / 5                           | TDatePickerComponent 2, TDateInputComponent 2, TButtonComponent 1, TFrameComponent 1      |
| date-picker: close      | 6 (тактов 1)         | 6                   | 0 / 0                | 0                           | 52 / 3                           | TDatePickerComponent 1, TDateInputComponent 1, TButtonComponent 1, TCalendarComponent 1   |
| date-picker: locale ru  | 207 (тактов 1)       | 11                  | 31 / 31              | 1078                        | 676 / 627                        | TButtonComponent 52, TDatePickerComponent 51, TDateInputComponent 51, TFrameComponent 50  |
| date-picker: locale en  | 205 (тактов 1)       | 9                   | 31 / 31              | 1078                        | 676 / 627                        | TButtonComponent 52, TDatePickerComponent 50, TDateInputComponent 50, TFrameComponent 50  |
| dialog: open            | 6 (тактов 2)         | 6                   | 0 / 0                | 0                           | 108 / 10                         | TButtonComponent 2, PreviewRootComponent 1, DialogPreview 1, TDialogComponent 1           |
| dialog: close           | 5 (тактов 1)         | 5                   | 0 / 0                | 0                           | 104 / 6                          | PreviewRootComponent 1, DialogPreview 1, TButtonComponent 1, TDialogComponent 1           |
| input: type             | 1 (тактов 1)         | 1                   | 0 / 0                | 0                           | 0 / 0                            | TInputComponent 1                                                                         |
| tabs: tab 2             | 9 (тактов 1)         | 9                   | 0 / 0                | 0                           | 0 / 0                            | TTabsItemComponent 2, TButtonComponent 2, TTabsContentComponent 2, PreviewRootComponent 1 |
| tabs: tab 1             | 9 (тактов 1)         | 9                   | 0 / 0                | 0                           | 0 / 0                            | TTabsItemComponent 2, TButtonComponent 2, TTabsContentComponent 2, PreviewRootComponent 1 |
| calendar: locale ru     | 201 (тактов 1)       | 5                   | 1550 / 31            | 30674                       | 0 / 0                            | TButtonComponent 100, TCalendarComponent 50, TPopoverComponent 50, PreviewRootComponent 1 |
| calendar: locale en     | 201 (тактов 1)       | 5                   | 1550 / 31            | 30674                       | 0 / 0                            | TButtonComponent 100, TCalendarComponent 50, TPopoverComponent 50, PreviewRootComponent 1 |
| number-input: locale ru | 151 (тактов 1)       | 4                   | 0 / 0                | 196                         | 0 / 0                            | TButtonComponent 100, TNumberInputComponent 50, PreviewRootComponent 1                    |
| number-input: locale en | 151 (тактов 1)       | 4                   | 0 / 0                | 196                         | 0 / 0                            | TButtonComponent 100, TNumberInputComponent 50, PreviewRootComponent 1                    |

Счёт — проходы шаблонов компонентов и такты обнаружения изменений (`тактов`): на каждое действие
— один-два такта.

Что видно:

- **Соседей действие не трогает.** Проходов шаблонов на странице из 50 копий столько же, сколько
  на странице из одной: компоненты на сигналах, и такт проверяет только виды, чьи сигналы
  сменились. Записей в DOM других копий нет. Записи вне страницы при открытии DatePicker и Dialog
  — `aria-hidden` (у Dialog — на окне и его подложке) на закрытых панелях 49 соседей, по атрибуту-двум на
  соседа — терпимо.
- **Отклик.** Действие на одной копии — до 47 мс до кадра при ×6; открытие панелей (Select, Menu,
  DatePicker) — 30–37 мс, на 10 мс дольше, чем у Svelte и Solid.
- **Язык страницы.** 50 полей DatePicker — 91–101 мс при ×6; 50 видимых календарей — 1,1 с. Записей
  в DOM на смене языка календарей в 30 раз больше, чем у Vue, по той же причине, что у Web
  Components: новая ячейка получает атрибуты уже в документе. Сетка собирается заново у всех
  платформ — [`report.md`](report.md).

## 2026-10-28 — Angular, неделя Calendar по месту в сетке

Ключ строки недели — её место в сетке, а не первая дата (задача 869fmu6nz). Смена языка с другим
первым днём недели (`ruRU` ⇄ `enUS`) оставляет в строке шесть дней из семи, и сетка месяца не
пересобирается целиком. Время до кадра на странице `calendar` из 50, мс; «до» — прошлый замер
журнала, «после» — `npm run interaction -- --pages calendar --rates 1,6` (×4 — тем же прогоном):

| Действие            | ×1       | ×4        | ×6         |
| ------------------- | -------- | --------- | ---------- |
| calendar: locale ru | 122 → 55 | 693 → 290 | 1140 → 488 |
| calendar: locale en | 119 → 56 | 685 → 281 | 1137 → 496 |

## 2026-11-09 — проверяемый запуск 2026-11-09-full

Новый собственный замер — [итоговый отчёт](../validation/report.md), [условия и команды](../validation/README.md), [manifest](../validation/runs/2026-11-09-full/manifest.json), [raw interaction](../validation/runs/2026-11-09-full/interaction-angular.json), [машинная сводка](../validation/runs/2026-11-09-full/summary.json). Статус данных: **measured**. Параметры и каждый повтор сохранены; исторические числа выше не переписаны.

## 2026-11-13 — аудит девяти новых компонентов

[Полный отчёт](../validation/new-components-2026-11-13.md). Source e0c94a76c; адаптеры измерены последовательно, n=50, rates=1/4/6, warm=2, reps=10; counting N=1/50, по 3 повтора. Медиана при чётном N — среднее двух центральных.

| Действие                  | Paint ×1/×4/×6 ms | Settled ×6 ms | INP ×6 ms | Update N1/N50 | Tick N1/N50 | Neighbor DOM writes max |
| ------------------------- | ----------------- | ------------- | --------- | ------------- | ----------- | ----------------------- |
| alert/dismiss             | 16.00/24.00/27.50 | 63.50         | 32.00     | 4.00/4.00     | 2.00/2.00   | 0                       |
| breadcrumbs/open          | 17.00/21.50/27.00 | 63.50         | 24.00     | 8.00/8.00     | 2.00/2.00   | 0                       |
| breadcrumbs/close         | 15.50/19.00/21.00 | 65.50         | 28.00     | 7.00/7.00     | 1.00/1.00   | 0                       |
| toggle-button/press       | 15.00/16.00/17.00 | 64.00         | 32.00     | 1.00/1.00     | 1.00/1.00   | 0                       |
| toggle-button/release     | 15.00/17.00/17.00 | 64.00         | 32.00     | 1.00/1.00     | 1.00/1.00   | 0                       |
| toggle-group/choose first | 16.00/18.00/20.00 | 64.00         | 32.00     | 2.00/2.00     | 1.00/1.00   | 0                       |
| toggle-group/clear first  | 16.00/18.00/20.00 | 63.00         | 32.00     | 2.00/2.00     | 1.00/1.00   | 0                       |
| code-block/snippet two    | 16.00/20.00/42.50 | 90.00         | 36.00     | 10.00/10.00   | 1.00/1.00   | 0                       |
| code-block/copy           | 16.00/18.50/33.00 | 92.00         | 32.00     | 9.00/9.00     | 2.00/2.00   | 0                       |
| code-block/snippet one    | 19.00/31.00/49.50 | 100.00        | 48.00     | 10.00/10.00   | 1.00/1.00   | 0                       |
| alert-dialog/open         | 17.00/21.00/24.00 | 64.00         | 32.00     | 5.00/5.00     | 2.00/2.00   | 0                       |
| alert-dialog/close        | 15.50/18.50/20.00 | 63.00         | 28.00     | 4.00/4.00     | 1.00/1.00   | 0                       |
| alert-dialog/cancel       | 16.00/20.50/23.00 | 66.00         | 24.00     | 5.00/5.00     | 1.00/1.00   | 0                       |
| alert-dialog/confirm      | 17.00/20.00/25.00 | 67.00         | 24.00     | 5.00/5.00     | 1.00/1.00   | 0                       |

Copy — время активации кнопки; успешность clipboard отдельно проверена exact-copy/denial browser tests. Статические Badge/Separator/Avatar не получают искусственного INP. Event Timing и render accounting имеют ограничения, указанные в полном отчёте; между адаптерами это разные механизмы, не универсальный CPU счётчик.

[Все исходные repetitions и имена рендеров](../validation/runs/audit-new-components-20261113/interaction-angular.json), [min/max/N](../validation/runs/audit-new-components-20261113/summary.json).
