import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '../../../..')
const run = 'benchmarks/validation/runs/audit-new-components-20261113/'
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const config = read(run + 'final-report-text.json')
const proof = read(run + 'coverage-index.json')
const matrix = read(run + 'matrix.json')
const file = path.join(
  root,
  'benchmarks/validation/new-components-2026-11-13.md',
)
let text = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
function section(start, end, body) {
  const a = text.indexOf(start),
    b = end ? text.indexOf(end, a + start.length) : text.length
  if (a < 0 || b < 0) throw Error('Missing section ' + start)
  text = text.slice(0, a) + body.trim() + '\n\n' + text.slice(b)
}
text = text.replace(/\*\*(?:Черновик:|Аудит выполнен;).*?\*\*/, config.status)
section(
  '## Источники и метод',
  '## Матрица 54 сочетаний',
  ['## Источники и метод', ...config.method].join('\n\n'),
)
const count = (x) =>
  x.passed +
  'P/' +
  x.failed +
  'F' +
  (x.pending || x.skipped ? '/' + (x.pending + x.skipped) + 'S' : '')
const row = (r, i) =>
  '| ' +
  [
    r.component,
    r.host,
    count(r.functional.chromium.counts) +
      '; ' +
      count(r.functional.webkit.counts),
    r.a11y.filter((a) => a.engine === 'chromium').length +
      '/' +
      r.a11y.filter((a) => a.engine === 'webkit').length,
    r.component === 'avatar' && r.host === 'webc'
      ? 'SIGNAL native img/UA'
      : 'no growth detected',
    r.soak.completeIndices.length + '/' + r.soak.directIndices.length,
    r.interaction.status ?? r.interaction.actions.length + ' actions x3x10',
    r.manual.status,
    r.parity.status,
    '[' +
      r.key +
      '](runs/audit-new-components-20261113/coverage-index.json#/rows/' +
      i +
      ')',
  ].join(' | ') +
  ' |'
section(
  '## Матрица 54 сочетаний',
  '## Вес и lifecycle timings',
  [
    '## Матрица 54 сочетаний',
    '',
    'P/F/S — фактически passed/failed/skipped functional cases Chromium; WebKit на указанном в proof index source SHA. Названия каждого теста, точные counts и JSON pointers по всем категориям находятся в последнем столбце. Axe — выполненные состояния C/W; это число не означает отсутствие moderate/incomplete. Soak complete/direct считает только полностью выполненные прямые переходы, all указан в index отдельно. Static interaction/keyboard N/A имеет причину в index.',
    '',
    '| Компонент | Host | Functional C; W | Axe C/W | Memory | Soak complete/direct | Interaction | Manual | Parity | Proof key |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...proof.rows.map(row),
    '',
    'Avatar.Group — вспомогательная lifecycle/slot поверхность, не десятый самостоятельный компонент аудита.',
    '',
    '| Host | Functional C; W | Axe C/W | Cycles | Parity | Proof key |',
    '| --- | --- | --- | --- | --- | --- |',
    ...proof.auxiliary.map(
      (r, i) =>
        '| ' +
        [
          r.host,
          count(r.functional.chromium.counts) +
            '; ' +
            count(r.functional.webkit.counts),
          '1/1',
          r.cycles.measured,
          r.parity.status,
          '[' +
            r.key +
            '](runs/audit-new-components-20261113/coverage-index.json#/auxiliary/' +
            i +
            ')',
        ].join(' | ') +
        ' |',
    ),
    '',
    'Статические Badge, Avatar, Separator и Avatar.Group не имеют собственного keyboard interaction: проверены семантика, accessible name/роль там, где они предусмотрены, варианты и динамические props/slots. Ссылки на соседние Menu/Tabs cases не приписывают их целиком всем компонентам.',
  ].join('\n'),
)
text = text.replace(
  /Seed7 replay115–115.*?Stock fallback mount не заменяет post-churn heap\./,
  config.nativeReplay,
)
if (!text.includes(config.nativeCaveat))
  text = text.replace(
    '## Interaction и изоляция',
    config.nativeCaveat + '\n\n## Interaction и изоляция',
  )
section('## Functional, axe, manual и CI', null, config.tail.join('\n\n'))
text = text
  .split('\n')
  .map((line) =>
    line.startsWith('|')
      ? line
      : line
          .replace(
            /(\d)(?=адаптер|страниц|цикл|сценари|компонент|провер|ошиб|случа|повтор|сесс|копий|изображени|набор|режим|контрол|PASS|FAIL|inherited|component|target|memory|functional|native|static|raw|cycles\b|cases\b|pages\b|tests\b|errors\b|reports\b|engine\b|host\b|both\b|timed|reps\b|rates\b|measured|warmup|DOM\b|listeners\b|KiB|ms\b|min\b)/g,
            '$1 ',
          )
          .replace(/(\d)B(?=\b|heap)/g, '$1 B'),
  )
  .join('\n')
const edits = [
  ['Все6 сессий30+min', 'Все 6 сессий длились более 30 минут'],
  ['первых3 samples', 'первых 3 samples'],
  ['за20 cycles', 'за 20 cycles'],
  ['validator21/21', 'validator 21/21'],
  ['повторили+6000', 'повторили +6000'],
  ['loaded50/50', 'loaded 50/50'],
  ['imports,4SVG', 'imports, 4 SVG'],
  ['Bheap', 'B heap'],
  ['объясняют+6000', 'объясняют +6000'],
  ['delta0', 'delta 0'],
  ['×3 rates ×10 reps ×6', '× 3 rates × 10 reps × 6'],
  ['max0', 'max 0'],
]
for (const [a, b] of edits) text = text.replaceAll(a, b)
fs.writeFileSync(file, text, 'utf8')
matrix.state =
  'complete audit with known Solid focus failure and native Chromium image retention signal'
matrix.functionalSources = proof.functionalSources
for (const [group, rows] of [
  ['rows', proof.rows],
  ['auxiliary', proof.auxiliary],
]) {
  for (const r of matrix[group]) {
    const p = rows.find((p) => p.component === r.component && p.host === r.host)
    if (!p) throw Error('Missing matrix proof ' + r.component + '/' + r.host)
    r.proofKey = p.key
    r.proofIndex = run + 'coverage-index.json'
    r.functional = {
      chromium: p.functional.chromium.counts,
      webkit: p.functional.webkit.counts,
    }
    r.parity = p.parity.status
  }
}
fs.writeFileSync(
  path.join(root, run + 'matrix.json'),
  JSON.stringify(matrix) + '\n',
)
console.log(
  JSON.stringify({
    rows: proof.rows.length,
    auxiliary: proof.auxiliary.length,
  }),
)
