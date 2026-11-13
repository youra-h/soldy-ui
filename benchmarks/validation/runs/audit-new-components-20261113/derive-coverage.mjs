import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = path.resolve(import.meta.dirname, '../../../..')
const base = 'benchmarks/validation/runs/'
const original = base + 'audit-new-components-20261113/'
const isolated = base + 'audit-new-components-20261113-readiness-full/'
const webkit = base + 'audit-new-components-20261113-readiness-full/'
const file = (f) => path.join(root, f)
const read = (f) => JSON.parse(fs.readFileSync(file(f), 'utf8'))
const hash = (f) =>
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(file(f)))
    .digest('hex')
const hosts = ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']
const targets = [
  'alert',
  'badge',
  'breadcrumbs',
  'separator',
  'toggle-button',
  'toggle-group',
  'code-block',
  'avatar',
  'alert-dialog',
]
const names = {
  Alert: 'alert',
  Badge: 'badge',
  Breadcrumbs: 'breadcrumbs',
  Separator: 'separator',
  ToggleButton: 'toggle-button',
  ToggleGroup: 'toggle-group',
  CodeBlock: 'code-block',
  Avatar: 'avatar',
  AlertDialog: 'alert-dialog',
}
const expectedAxe = {
  alert: 1,
  badge: 7,
  breadcrumbs: 4,
  separator: 4,
  'toggle-button': 4,
  'toggle-group': 4,
  'code-block': 4,
  avatar: 4,
  'alert-dialog': 2,
  'avatar-group': 1,
}
const actions = {
  alert: ['dismiss'],
  breadcrumbs: ['open', 'close'],
  'toggle-button': ['press', 'release'],
  'toggle-group': ['choose first', 'clear first'],
  'code-block': ['snippet two', 'copy', 'snippet one'],
  'alert-dialog': ['open', 'close', 'cancel', 'confirm'],
}
const reports = {
  chromium: { path: isolated + 'chromium-tests.json' },
  webkit: { path: webkit + 'webkit-tests.json' },
}
for (const entry of Object.values(reports)) entry.data = read(entry.path)
const manual = read(original + 'manual-keyboard-all-hosts.json')
const axe = read(original + 'a11y-target-review-final.json')
const pointer = (source, path) => ({ source, pointer: path })
function casesFor(component, host, engine) {
  const out = [],
    entry = reports[engine]
  entry.data.testResults.forEach((suite, suiteIndex) => {
    const name = suite.name.replaceAll('\\', '/'),
      basename = name.split('/').at(-1)
    suite.assertionResults.forEach((test, index) => {
      const scope = test.ancestorTitles.join(' ')
      const explicit = hosts.find((id) =>
        new RegExp('(?:/ |· )' + id + '(?:$| )').test(scope),
      )
      let mapped = null,
        actualHost = explicit
      if (basename === 'shared-scenarios-audit.spec.ts')
        mapped = test.title.split('/')[0]
      else if (basename === 'new-components-audit.spec.ts')
        mapped = names[test.title.split(' ')[0]]
      else {
        const direct = {
          'alert.spec.ts': 'alert',
          'badge.spec.ts': 'badge',
          'badge-entry.spec.ts': 'badge',
          'badge-base.spec.ts': 'badge',
          'breadcrumbs.spec.ts': 'breadcrumbs',
          'separator.spec.ts': 'separator',
          'code-block.spec.ts': 'code-block',
          'alert-dialog.spec.ts': 'alert-dialog',
        }
        mapped = direct[basename]
        if (basename === 'avatar.spec.ts')
          mapped = /overlaps every explicit child|keeps the count/.test(
            test.title,
          )
            ? 'avatar-group'
            : 'avatar'
        if (basename === 'toggle.spec.ts')
          mapped =
            /^shows persistent pressed styling|^preserves an explicit submit type/.test(
              test.title,
            )
              ? 'toggle-button'
              : 'toggle-group'
        if (mapped && !actualHost) actualHost = 'vue'
      }
      if (mapped === component && actualHost === host)
        out.push({
          ...pointer(
            entry.path,
            '/testResults/' + suiteIndex + '/assertionResults/' + index,
          ),
          file: basename,
          name: test.fullName,
          status: test.status,
          durationMs: test.duration,
        })
    })
  })
  if (!out.some((test) => test.status === 'passed' || test.status === 'failed'))
    throw new Error(
      'No executed functional case: ' + engine + '/' + host + '/' + component,
    )
  return {
    counts: Object.fromEntries(
      ['passed', 'failed', 'pending', 'skipped', 'todo'].map((s) => [
        s,
        out.filter((x) => x.status === s).length,
      ]),
    ),
    cases: out,
  }
}
function manualOutcome(check) {
  const tests = {}
  const ensure = (name, value) => {
    tests[name] = Boolean(value)
  }
  switch (check.component) {
    case 'ToggleButton':
      ensure('native button', check.type === 'button')
      ensure('initial unpressed', check.initialPressed === 'false')
      ensure('Enter press', check.afterEnter === 'true')
      ensure('Space release', check.afterSpace === 'false')
      break
    case 'ToggleGroup':
      ensure('four items', check.itemCount === 4)
      ensure('one tab stop', check.tabStops === 1)
      ensure('End selection', check.endPressed === 'true')
      ensure(
        'End focus',
        check.endFocus?.tag === 'BUTTON' &&
          check.endFocus?.class.includes('so-toggle-group-item'),
      )
      ensure(
        'Home focus',
        check.homeFocus?.tag === 'BUTTON' &&
          check.homeFocus?.class.includes('so-toggle-group-item'),
      )
      ensure(
        'different Home/End',
        check.homeFocus?.text !== check.endFocus?.text,
      )
      break
    case 'CodeBlock':
      ensure('selected second', check.second?.selected === 'true')
      ensure('exact second source', check.second?.source === 'const two = 2;\n')
      ensure('second focus', check.second?.focus?.text === 'Two')
      ensure('Home selection', check.afterHome === 'true')
      ensure('Home focus', check.homeFocus?.text === 'One')
      break
    case 'Breadcrumbs':
      ensure(
        'closed reference',
        check.closedReference?.resolved &&
          check.closedReference?.expanded === 'false',
      )
      ensure(
        'open reference',
        check.openReference?.resolved &&
          check.openReference?.expanded === 'true' &&
          check.openReference?.panelRole === 'menu' &&
          check.openReference?.panelOpen === 'true',
      )
      ensure(
        'Home/End menu focus',
        check.endMenu?.tag === 'A' &&
          check.homeMenu?.tag === 'A' &&
          check.endMenu?.text !== check.homeMenu?.text,
      )
      ensure(
        'closed on Escape',
        check.closedExpanded === 'false' && check.openMenus === 0,
      )
      ensure('trigger focus restored', check.triggerFocused === true)
      break
    case 'AlertDialog':
      ensure(
        'named modal',
        check.initialDialog?.role === 'alertdialog' &&
          check.initialDialog?.modal === 'true' &&
          check.initialDialog?.name?.trim() &&
          check.initialDialog?.description?.trim(),
      )
      ensure('safe initial focus', check.initialDialog?.safeFocused === true)
      ensure(
        'native Tab containment',
        check.trap?.length === 5 && check.trap.every((x) => x === true),
      )
      ensure('Escape close', check.openAfterEscape === 0)
      ensure('opener return', check.openerFocused === true)
      break
    case 'Alert':
      ensure('dismissed', check.visibleAfterClose === false)
      break
    case 'Badge':
      ensure('static keyboard N/A', check.keyboard?.startsWith('N/A'))
      ensure(
        'inline default observed',
        check.role === null && check.label === null && check.text === '8',
      )
      break
    case 'Avatar':
      ensure('static keyboard N/A', check.keyboard?.startsWith('N/A'))
      ensure(
        'named image',
        check.role === 'img' &&
          Boolean(check.label?.trim()) &&
          check.text === 'AL',
      )
      break
    case 'Separator':
      ensure('static keyboard N/A', check.keyboard?.startsWith('N/A'))
      ensure(
        'semantic horizontal',
        check.role === 'separator' && check.orientation === 'horizontal',
      )
      break
    default:
      throw new Error('Unknown manual component ' + check.component)
  }
  const failed = Object.entries(tests)
    .filter(([, pass]) => !pass)
    .map(([name]) => name)
  return {
    status: failed.length
      ? 'FAIL'
      : check.keyboard
        ? 'N/A keyboard; observations PASS'
        : 'PASS',
    checks: tests,
    failed,
  }
}

const index = {
  schemaVersion: 1,
  generated: new Date().toISOString(),
  functionalSources: Object.fromEntries(
    Object.entries(reports).map(([engine, entry]) => {
      const metadataPath = entry.path.replace(
        engine + '-tests.json',
        engine + '-command.json',
      )
      const metadata = read(metadataPath)
      return [
        engine,
        {
          report: entry.path,
          metadata: metadataPath,
          commit: metadata.commit,
          runId: metadata.runId,
          counts: metadata.tests,
        },
      ]
    }),
  ),
  measuredSourceCommit: 'e0c94a76c402a8c425c197768397384fd5a4c5af',
  supplementCommit: '62ee161f34db66c79771bcea4c8edfd97ecdbbd4',
  rows: [],
  auxiliary: [],
}
for (const component of [...targets, 'avatar-group'])
  for (const host of hosts) {
    const raw = read(original + 'pages-' + host + '.json'),
      p = raw.pages[component],
      soak = read(original + 'soak-' + host + '.json'),
      interaction = actions[component]
    const direct = soak.transitions
      .map((t, index) => ({ ...t, index }))
      .filter((t) => t.page === component)
    const functional = Object.fromEntries(
      ['chromium', 'webkit'].map((engine) => [
        engine,
        casesFor(component, host, engine),
      ]),
    )
    const a11y = axe.findings.filter(
      (x) => x.component === component && x.adapter === host,
    )
    if (
      a11y.length !== 2 * expectedAxe[component] ||
      ['chromium', 'webkit'].some(
        (engine) =>
          a11y.filter((x) => x.browser === engine).length !==
          expectedAxe[component],
      )
    )
      throw new Error('No axe coverage ' + host + '/' + component)
    const manualHost = manual.results.findIndex((x) => x.framework === host)
    const manualCheck = manual.results[manualHost].checks.findIndex(
      (x) => (names[x.component] ?? x.component.toLowerCase()) === component,
    )
    const paritySource = original + 'parity/parity-' + host + '.json',
      parity = read(paritySource).pages[component]
    if (!parity?.steps?.length)
      throw new Error('Missing parity page ' + host + '/' + component)
    const parityReport = fs.readFileSync(
      file(original + 'parity/parity-report.md'),
      'utf8',
    )
    const section =
      host === 'vue'
        ? ''
        : (parityReport.split('## ' + host + ':')[1]?.split('\n## ')[0] ?? '')
    if (host !== 'vue' && !parityReport.includes('## ' + host + ':'))
      throw new Error('Missing parity comparison section ' + host)
    const differences = [
      ...section.matchAll(new RegExp('^### ' + component + ' · (.+)$', 'gm')),
    ].map((x) => x[1])
    const row = {
      key: component + '/' + host,
      component,
      host,
      functional,
      a11y: a11y.map((item) => ({
        ...pointer(item.source, ''),
        engine: item.browser,
        case: item.case,
        unresolved: item.unresolved,
        waived: item.waived,
        violations: item.violations,
        incomplete: item.incomplete,
      })),
      cycles: {
        ...pointer(original + 'pages-' + host + '.json', '/pages/' + component),
        measured: p.cycles.length - raw.warm,
        warm: raw.warm,
        copies: raw.n,
        activeCopies: raw.act,
        measuredIndices: p.cycles.map((_, i) => i).slice(raw.warm),
        actionsPerCycle: [
          ...new Set(p.cycles.slice(raw.warm).map((x) => x.actions)),
        ],
        timingFields: ['time', 'updateTime', 'unmountTime'],
        base: p.base,
        end: p.end,
        overallHostIncomplete: host === 'angular',
        supplement:
          host === 'angular'
            ? pointer(
                base +
                  'audit-new-components-20261113-supplement/pages-angular.json',
                '/pages/' + component,
              )
            : null,
      },
      soak: {
        ...pointer(original + 'soak-' + host + '.json', '/transitions'),
        directIndices: direct.map((x) => x.index),
        completeIndices: direct
          .filter((x) => !x.skipped && !x.stopped)
          .map((x) => x.index),
        allIndices: soak.transitions
          .map((x, i) => (x.page === 'all' ? i : -1))
          .filter((i) => i >= 0),
        note: 'all transitions may stop/skip within a component; not counted as complete direct coverage',
      },
      control: pointer(original + 'control-' + host + '.json', ''),
      interaction: interaction
        ? {
            ...pointer(original + 'interaction-' + host + '.json', ''),
            rates: [1, 4, 6],
            reps: 10,
            countReps: 3,
            actions: interaction.map((a) => ({
              name: a,
              timing: [1, 4, 6].map((rate) =>
                pointer(
                  original + 'interaction-' + host + '.json',
                  '/timing/' +
                    component +
                    '/' +
                    rate +
                    '/' +
                    a.replaceAll('~', '~0').replaceAll('/', '~1'),
                ),
              ),
              counting: [1, 50].map((n) =>
                pointer(
                  original + 'interaction-' + host + '.json',
                  '/renders/' +
                    component +
                    '/' +
                    n +
                    '/' +
                    a.replaceAll('~', '~0').replaceAll('/', '~1'),
                ),
              ),
            })),
          }
        : {
            status: 'N/A',
            reason:
              'Static visual/semantic component; no component-specific user action or INP claim',
          },
      manual:
        manualCheck >= 0
          ? {
              ...pointer(
                original + 'manual-keyboard-all-hosts.json',
                '/results/' + manualHost + '/checks/' + manualCheck,
              ),
              ...manualOutcome(manual.results[manualHost].checks[manualCheck]),
            }
          : {
              status: 'N/A',
              reason:
                'Auxiliary static group was not a separate integrated-browser keyboard case',
            },
      parity: {
        ...pointer(paritySource, '/pages/' + component),
        steps: parity.steps.length,
        labels: parity.steps.map((x) => x.label),
        errors: parity.errors,
        comparisonReport: original + 'parity/parity-report.md',
        status: parity.errors.length || differences.length ? 'FAIL' : 'PASS',
        differences,
      },
    }
    ;(component === 'avatar-group' ? index.auxiliary : index.rows).push(row)
  }
if (
  index.rows.length !== 54 ||
  index.auxiliary.length !== 6 ||
  new Set(index.rows.map((x) => x.key)).size !== 54
)
  throw new Error('Invalid matrix dimensions')
index.files = Object.fromEntries(
  [
    ...new Set([
      reports.chromium.path,
      reports.webkit.path,
      ...[...index.rows, ...index.auxiliary].flatMap((r) => [
        r.cycles.source,
        r.soak.source,
        r.control.source,
        r.parity.source,
        original + 'interaction-' + r.host + '.json',
        ...(r.cycles.supplement ? [r.cycles.supplement.source] : []),
        ...r.a11y.map((x) => x.source),
      ]),
      original + 'manual-keyboard-all-hosts.json',
    ]),
  ].map((f) => [f, hash(f)]),
)
fs.writeFileSync(
  file(original + 'coverage-index.json'),
  JSON.stringify(index) + '\n',
)
console.log(
  JSON.stringify({
    rows: index.rows.length,
    auxiliary: index.auxiliary.length,
    sourceFiles: Object.keys(index.files).length,
  }),
)
