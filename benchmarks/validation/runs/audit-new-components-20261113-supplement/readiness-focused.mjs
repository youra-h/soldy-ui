import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'
const root = process.cwd(),
  out = path.join(
    root,
    'benchmarks/validation/runs/audit-new-components-20261113-readiness',
  )
fs.mkdirSync(out, { recursive: true })
const hash = (p) =>
  crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
for (const engine of ['chromium', 'webkit']) {
  const report = path.join(out, engine + '-focused-tests.json'),
    log = fs.openSync(path.join(out, engine + '-focused.txt'), 'w')
  const args = [
    path.join(
      path.dirname(process.execPath),
      'node_modules/npm/bin/npm-cli.js',
    ),
    'run',
    engine === 'webkit' ? 'test:layout:webkit' : 'test:layout',
    '--',
    ...(engine === 'chromium' ? ['--'] : []),
    'browser/new-components-audit.spec.ts',
    '--reporter=default',
    '--reporter=json',
    '--outputFile=' + report,
  ]
  const metadata = {
    started: new Date().toISOString(),
    engine,
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    sourceHash: hash(
      'packages/playground/vue/browser/new-components-audit.spec.ts',
    ),
    executable: process.execPath,
    args,
    scope:
      'All-six 96-case audit suite after actual-menu-focus readiness synchronization; known Solid Escape assertion remains ordinary failure',
  }
  metadata.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: ['ignore', log, log] })
    child.once('error', reject)
    child.once('exit', resolve)
  })
  fs.closeSync(log)
  metadata.finished = new Date().toISOString()
  const result = JSON.parse(fs.readFileSync(report, 'utf8'))
  metadata.counts = {
    total: result.numTotalTests,
    passed: result.numPassedTests,
    failed: result.numFailedTests,
    pending: result.numPendingTests,
  }
  metadata.reportHash = hash(report)
  metadata.collectorHash = hash(import.meta.filename)
  fs.writeFileSync(
    path.join(out, engine + '-focused-command.json'),
    JSON.stringify(metadata) + '\n',
  )
  console.log(JSON.stringify(metadata.counts))
}
