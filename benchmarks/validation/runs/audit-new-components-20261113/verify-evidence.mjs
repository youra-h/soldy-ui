import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '../../../..')
const run = 'benchmarks/validation/runs/audit-new-components-20261113/'
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
const proof = read(run + 'coverage-index.json')
const loaded = new Map()
let pointers = 0
function visit(value) {
  if (!value || typeof value !== 'object') return
  if (typeof value.source === 'string' && typeof value.pointer === 'string') {
    if (!loaded.has(value.source)) loaded.set(value.source, read(value.source))
    let target = loaded.get(value.source)
    for (const escaped of value.pointer.split('/').slice(1)) {
      const key = escaped.replaceAll('~1', '/').replaceAll('~0', '~')
      if (target === null || typeof target !== 'object' || !(key in target))
        throw Error('Missing pointer ' + value.source + '#' + value.pointer)
      target = target[key]
    }
    pointers++
  }
  for (const child of Object.values(value)) visit(child)
}
for (const row of [...proof.rows, ...proof.auxiliary]) visit(row)
if (proof.rows.length !== 54 || proof.auxiliary.length !== 6)
  throw Error('Matrix dimensions')
for (const [source, expected] of Object.entries(proof.files)) {
  if (hash(fs.readFileSync(path.join(root, source))) !== expected)
    throw Error('Proof hash mismatch ' + source)
}
const bundle = read(run + 'evidence-index.json')
for (const item of bundle.files) {
  const bytes = fs.readFileSync(path.join(root, item.source))
  if (bytes.length !== item.bytes || hash(bytes) !== item.sha256)
    throw Error('Bundle hash mismatch ' + item.source)
}
if (bundle.files.some((f) => f.source.endsWith('native-followup-draft.json')))
  throw Error('Private optional draft included')
if (process.argv.includes('--index')) {
  const git = (args, input) =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      input,
      maxBuffer: 1 << 28,
    })
  const staged = new Map(
    git(['ls-files', '--stage', '-z'])
      .split('\0')
      .filter(Boolean)
      .map((line) => {
        const tab = line.indexOf('\t'),
          header = line.slice(0, tab).split(' ')
        return [line.slice(tab + 1), header[1]]
      }),
  )
  const sources = [
    ...bundle.files.map((f) => f.source),
    run + 'evidence-index.json',
  ]
  const raw = git(
    ['hash-object', '--no-filters', '--stdin-paths'],
    sources.join('\n') + '\n',
  )
    .trim()
    .split('\n')
  sources.forEach((source, i) => {
    if (staged.get(source) !== raw[i])
      throw Error('Index bytes differ ' + source)
  })
  if (
    staged.has(
      'benchmarks/validation/runs/audit-new-components-20261113-supplement/native-followup-draft.json',
    )
  )
    throw Error('Optional draft staged')
}
console.log(
  JSON.stringify({
    rows: proof.rows.length,
    auxiliary: proof.auxiliary.length,
    pointers,
    proofHashes: Object.keys(proof.files).length,
    bundleFiles: bundle.files.length,
    indexBytesVerified: process.argv.includes('--index'),
  }),
)
