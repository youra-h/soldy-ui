import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = path.resolve(import.meta.dirname, '../../../..')
const main = 'benchmarks/validation/runs/audit-new-components-20261113/'
const sources = {
  chromium:
    'benchmarks/validation/runs/audit-new-components-20261113-readiness-full/',
  webkit:
    'benchmarks/validation/runs/audit-new-components-20261113-readiness-full/',
}
const counts = {
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
const hosts = ['vue', 'react', 'svelte', 'solid', 'webc', 'angular']
const hash = (f) =>
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(root, f)))
    .digest('hex')
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
const result = {
  schemaVersion: 1,
  generated: new Date().toISOString(),
  collectorHash: hash(main + 'derive-a11y-review.mjs'),
  originalReview: {
    source: main + 'a11y-target-review.json',
    sha256: hash(main + 'a11y-target-review.json'),
    note: 'Immutable initial e0c review retained; this separate final review adds actual computed contrast and native keyboard proof.',
  },
  totals: {},
  targetCasesPerEngine: 210,
  findings: [],
  dispositions: {},
  assistiveTechnology: {
    NVDA: 'unavailable; not verified',
    VoiceOver: 'unavailable; not verified',
    liveRegionSpeech: 'not verified',
  },
}
const simplify = (items) =>
  items.map((item) => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.map((n) => ({
      target: n.target,
      html: n.html,
      messages: [...n.any, ...n.all, ...n.none]
        .map((x) => x.message)
        .filter(Boolean),
    })),
  }))
for (const [engine, base] of Object.entries(sources)) {
  const meta = read(base + engine + '-command.json'),
    directory = base + 'axe-' + engine + '/'
  if (!meta.runId || meta.findings.length || meta.summaryExitCode)
    throw new Error('Invalid fresh browser collection ' + engine)
  const summary = read(directory + 'summary-' + meta.runId + '.json')
  if (
    summary.errors.length ||
    summary.reports !== 828 ||
    summary.unresolvedNodes ||
    summary.staleExceptions
  )
    throw new Error('Incomplete fresh axe ' + engine)
  result.totals[engine] = {
    runId: meta.runId,
    sourceCommit: meta.commit,
    full: summary,
    target: {
      reports: 0,
      violations: {},
      incomplete: {},
      incompleteCases: 0,
      incompleteNodes: 0,
    },
  }
  for (const host of hosts)
    for (const filename of fs.readdirSync(
      path.join(root, directory, host, meta.runId),
    )) {
      const source = directory + host + '/' + meta.runId + '/' + filename,
        d = read(source)
      if (!Object.hasOwn(counts, d.component)) continue
      if (filename.includes('.setup.'))
        throw new Error('Target setup failure ' + source)
      const finding = {
        browser: engine,
        adapter: host,
        component: d.component,
        case: d.case,
        source,
        sha256: hash(source),
        unresolved: d.gate.failures.length,
        waived: d.gate.waived.length,
        violations: simplify(d.violations),
        incomplete: simplify(d.incomplete),
      }
      if (finding.unresolved || finding.waived)
        throw new Error('Unresolved/waived target ' + source)
      result.findings.push(finding)
      const target = result.totals[engine].target
      target.reports++
      if (d.incomplete.length) target.incompleteCases++
      for (const key of ['violations', 'incomplete'])
        for (const item of d[key]) {
          const existing = (target[key][item.id] ??= {
            cases: 0,
            nodes: 0,
            impact: item.impact,
          })
          existing.cases++
          existing.nodes += item.nodes.length
          if (key === 'incomplete') target.incompleteNodes += item.nodes.length
        }
    }
  for (const host of hosts)
    for (const [component, n] of Object.entries(counts))
      if (
        result.findings.filter(
          (x) =>
            x.browser === engine &&
            x.adapter === host &&
            x.component === component,
        ).length !== n
      )
        throw new Error(
          'Missing target ' + engine + '/' + host + '/' + component,
        )
  if (result.totals[engine].target.reports !== 210)
    throw new Error('Wrong target total')
}
const proof = (f) => ({ source: f, sha256: hash(f) })
result.dispositions = {
  region: {
    status: 'retained moderate violation; not waived',
    review:
      'Portaled Breadcrumbs menu is outside the preview navigation landmark. Existing ACCESSIBILITY documents this application-landmark limitation.',
    proofs: [
      proof('ACCESSIBILITY.md'),
      proof(main + 'manual-keyboard-all-hosts.json'),
    ],
  },
  'color-contrast': {
    status:
      'original incomplete retained; supplementary visual checks passed for recorded nodes',
    review:
      'Neutral Avatar named/error/fallback and group children/count: 180 actual composed-color observations across six hosts and two schemes. Existing browser Avatar tests separately cover chromatic variants and forced colors. CodeBlock unhighlighted gutter: real opaque-root contrast 7.558072756 in oren and 5.044798946 in oren-dark, opacity1. Aria-hidden was not used as visual proof. These are scoped observations, not global contrast conformance.',
    proofs: [
      proof(
        'benchmarks/validation/runs/audit-new-components-20261113-supplement/avatar-contrast.json',
      ),
      proof(
        'benchmarks/validation/runs/audit-new-components-20261113-supplement/chromium-contrast.txt',
      ),
      proof('packages/playground/vue/browser/avatar.spec.ts'),
      proof('packages/playground/vue/browser/new-components-audit.spec.ts'),
    ],
  },
  'aria-valid-attr-value': {
    status: 'original incomplete retained; direct references checked',
    review:
      'All six native keyboard walkthroughs checked closed/open aria-controls resolution to the actual menu panel, expanded state and closure. Automatic inability to determine reference is not erased.',
    proofs: [proof(main + 'manual-keyboard-all-hosts.json')],
  },
  'label-content-name-mismatch': {
    status: 'needs-review retained; descriptive name observed',
    review:
      'Visible ellipsis glyph has localized descriptive Show hidden breadcrumbs name. The symbol is not treated as ordinary label text; no formal automatic text-name pass is claimed.',
    proofs: [proof(main + 'manual-keyboard-all-hosts.json')],
  },
  'aria-hidden-focus': {
    status: 'original incomplete retained; native focus containment observed',
    review:
      'Background is hidden/inert while modal is open. All-six native Tab/Shift+Tab, safe initial focus and opener return checks passed; supplementary manual observations agree. No screen-reader speech result is implied.',
    proofs: [
      proof(main + 'manual-keyboard-all-hosts.json'),
      proof('packages/playground/vue/browser/new-components-audit.spec.ts'),
    ],
  },
}
result.inheritedException = {
  task: '869fpjgvg',
  scope:
    'Toasts outside the nine audited components; six cases/twelve nodes per engine',
  status:
    'retained serious contrast finding; full-inventory contrast not passed',
}
fs.writeFileSync(
  path.join(root, main, 'a11y-target-review-final.json'),
  JSON.stringify(result) + '\n',
)
console.log(
  JSON.stringify({
    totals: Object.fromEntries(
      Object.entries(result.totals).map(([e, x]) => [e, x.target]),
    ),
    findings: result.findings.length,
  }),
)
