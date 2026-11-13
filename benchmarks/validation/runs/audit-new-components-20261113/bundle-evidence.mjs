import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '../../../..')
const base = 'benchmarks/validation/runs/'
const run = base + 'audit-new-components-20261113/'
const output = run + 'evidence-index.json'
const excluded =
  base + 'audit-new-components-20261113-supplement/native-followup-draft.json'
const hash = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex')
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))

function files(directory) {
  return fs
    .readdirSync(path.join(root, directory), { withFileTypes: true })
    .flatMap((entry) => {
      const relative = directory + '/' + entry.name
      return entry.isDirectory() ? files(relative) : [relative]
    })
}

const directories = fs
  .readdirSync(path.join(root, base), { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      entry.name.startsWith('audit-new-components-20261113'),
  )
  .map((entry) => base + entry.name)
const maintained = [
  'ACCESSIBILITY.md',
  'tools/english/comments.mjs',
  'tools/english/comments.test.mjs',
  'benchmarks/validation/new-components-2026-11-13.md',
  'benchmarks/parity/report.md',
  ...['vue', 'react', 'angular', 'svelte', 'solid', 'webc'].flatMap((host) => [
    'benchmarks/pages/' + host + '.md',
    'benchmarks/interaction/' + host + '.md',
  ]),
]
const all = [...directories.flatMap(files), ...maintained]
  .filter((p) => p !== output && p !== excluded)
  .sort()
const entries = all.map((source) => {
  const bytes = fs.readFileSync(path.join(root, source))
  const encoding =
    bytes[0] === 255 && bytes[1] === 254
      ? 'UTF-16LE with BOM'
      : /\.(?:json|md|mjs|txt)$/.test(source)
        ? 'UTF-8 bytes as retained'
        : 'binary'
  return { source, bytes: bytes.length, sha256: hash(bytes), encoding }
})
const original = read(run + 'manifest.json')
const recovery = read(
  base + 'audit-new-components-20261113-supplement/pages-angular-command.json',
)
const current = git('rev-parse', 'HEAD')
const libraryDelta = git(
  'diff',
  '--name-only',
  '0f9009fa76a8c9af15340f1e4a87d54ed834fad1',
  current,
  '--',
  'packages/core',
  'packages/setup',
  'packages/plugins',
  'packages/ui',
  'packages/themes',
  'tools/bench-pages',
  'tools/bench-interaction',
)
if (libraryDelta)
  throw Error('Runtime changed after frozen runtime: ' + libraryDelta)
const index = {
  schemaVersion: 1,
  generated: new Date().toISOString(),
  collector: run + 'bundle-evidence.mjs',
  sourcePhases: {
    original: {
      commit: original.commit,
      manifest: run + 'manifest.json',
      stages: original.stages,
      summary: run + 'summary.json',
      status:
        '23/24 measured cells; original Angular full-registry pages incomplete retained',
    },
    recovery: {
      commit: recovery.commit,
      command:
        base +
        'audit-new-components-20261113-supplement/pages-angular-command.json',
      status:
        '47 pages and 3 tours complete; no findings; separate single-host timing context',
    },
    mergedRuntime: {
      commit: '0f9009fa76a8c9af15340f1e4a87d54ed834fad1',
      main: 'e1ba2a88c99fc48224c7bc7cb4b8cc3cdf2015d0',
      parityCommand: run + 'parity-command.json',
      status: 'One known Solid Breadcrumbs focus difference',
    },
    keyboardTests: {
      commit: 'e37ecc83583be86fa2acf7f7edc2bda9213e17c3',
      change:
        'Actual menu endpoint focus readiness before next key; final Escape assertion unchanged',
      runtimeDeltaFrom0f900: libraryDelta,
      fullCommands: ['chromium', 'webkit'].map(
        (engine) =>
          base +
          'audit-new-components-20261113-readiness-full/' +
          engine +
          '-command.json',
      ),
    },
    delivery: {
      sourceHeadAtCollection: current,
      scope:
        'Final docs/evidence and bounded English scan commit is reported in PR and workflow handoff; no recursive commit solely to embed its own hash',
    },
  },
  originalSourceSnapshotCount: Object.keys(original.sourceHashes).length,
  recoverySourceSnapshotCount: Object.keys(recovery.sourceHashes).length,
  exclusions: [
    {
      source: excluded,
      reason:
        'Optional native diagnostic task draft remains local pending explicit owner decision; excluded from versioned evidence',
    },
  ],
  rawPolicy:
    'Original raw JSON/log/heaps and failed attempts are preserved byte for byte. Gzip heaps must be decompressed before DevTools inspection. UTF-16LE diagnostic log encoding is explicitly retained. Derivation scripts may produce new timestamps when rerun; verify entries before regeneration.',
  files: entries,
}
fs.writeFileSync(path.join(root, output), JSON.stringify(index) + '\n')
console.log(
  JSON.stringify({
    files: entries.length,
    bytes: entries.reduce((n, f) => n + f.bytes, 0),
    excludedDraft: excluded,
    head: current,
  }),
)
