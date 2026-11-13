import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '../../../..')
const [id, stage] = process.argv.slice(2)

if (!/^[a-z0-9-]+$/.test(id ?? '') || !['chromium', 'webkit', 'parity'].includes(stage))
	throw new Error('Expected audit run ID and chromium, webkit or parity')

const out = path.join(root, 'benchmarks/validation/runs', id)
const metadataFile = path.join(out, stage + '-command.json')

fs.mkdirSync(out, { recursive: true })
if (fs.existsSync(metadataFile)) throw new Error('Refusing to overwrite browser evidence')

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const write = () => fs.writeFileSync(metadataFile, JSON.stringify(metadata) + '\n')
const npm = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')
const args = [
	npm,
	'run',
	stage === 'parity' ? 'test:parity' : stage === 'webkit' ? 'test:layout:webkit' : 'test:layout',
]
const testReport = path.join(root, 'packages/playground/vue/.vitest', 'audit-' + id + '.json')

if (stage === 'chromium' || stage === 'webkit') {
	fs.mkdirSync(path.dirname(testReport), { recursive: true })
	fs.rmSync(testReport, { force: true })
	args.push(
		'--',
		...(stage === 'chromium' ? ['--'] : []),
		'--reporter=default',
		'--reporter=json',
		'--outputFile=' + testReport,
	)
}

const metadata = {
	stage,
	executable: process.execPath,
	args,
	cwd: root,
	started: new Date().toISOString(),
	commit: git('rev-parse', 'HEAD'),
	dirtyState: git('status', '--porcelain'),
	lockHash: hash(path.join(root, 'package-lock.json')),
	node: process.version,
	collectorHash: hash(import.meta.filename),
	collectorBase:
		'tools/bench-validation/browser-audit.mjs at 62ee161f34db66c79771bcea4c8edfd97ecdbbd4',
	collectorBaseHash: '299336549ebe072e789ce103e943549bc7e495f95002eb7addd19b1a5df66831',
	outputs: [],
	findings: [],
}

const parityNames = ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']
	.map((fw) => 'parity-' + fw + '.json')
	.concat('parity-report.md')

if (stage === 'parity')
	for (const name of parityNames)
		fs.rmSync(path.join(root, 'tools/bench-pages/results', name), { force: true })

write()
const log = fs.openSync(path.join(out, stage + '.txt'), 'w')

console.log(metadata.started + ' START ' + stage)
try {
	metadata.exitCode = await new Promise((resolve, reject) => {
		const child = spawn(process.execPath, args, { cwd: root, stdio: ['ignore', log, log] })

		metadata.pid = child.pid
		write()
		child.once('error', reject)
		child.once('exit', (code, signal) => {
			metadata.signal = signal
			resolve(code)
		})
	})
} finally {
	fs.closeSync(log)
	metadata.finished = new Date().toISOString()
	write()
}

function preserve(source, destination) {
	if (!fs.existsSync(source)) return
	if (fs.statSync(source).isDirectory()) {
		fs.mkdirSync(destination, { recursive: true })
		for (const name of fs.readdirSync(source))
			preserve(path.join(source, name), path.join(destination, name))
	} else {
		fs.mkdirSync(path.dirname(destination), { recursive: true })
		fs.copyFileSync(source, destination)
		metadata.outputs.push({
			file: path.relative(out, destination).replaceAll('\\', '/'),
			sha256: hash(destination),
		})
	}
}

if (stage === 'parity') {
	for (const name of parityNames) {
		const source = path.join(root, 'tools/bench-pages/results', name)

		if (!fs.existsSync(source)) metadata.findings.push('Missing fresh parity output: ' + name)
		else preserve(source, path.join(out, 'parity', name))
	}
} else {
	const axe = path.join(root, 'packages/playground/vue/.vitest/a11y', stage)

	if (fs.existsSync(axe))
		for (const name of fs
			.readdirSync(axe)
			.filter((name) => /^run-[a-f0-9-]+.json$/.test(name))) {
			const manifest = JSON.parse(fs.readFileSync(path.join(axe, name), 'utf8'))

			if (
				!Number.isFinite(Date.parse(manifest.startedAt)) ||
				new Date(manifest.startedAt) < new Date(metadata.started) ||
				manifest.commit !== metadata.commit
			)
				continue

			preserve(path.join(axe, name), path.join(out, 'axe-' + stage, name))
			for (const adapter of manifest.expectedAdapters)
				preserve(
					path.join(axe, adapter, manifest.runId),
					path.join(out, 'axe-' + stage, adapter, manifest.runId),
				)
			const summary = path.join(out, 'axe-' + stage, 'summary-' + manifest.runId + '.json')

			try {
				fs.writeFileSync(
					summary,
					execFileSync(
						process.execPath,
						['packages/playground/vue/browser/axe/summary.mjs', stage, manifest.runId],
						{ cwd: root, encoding: 'utf8' },
					),
				)
			} catch (error) {
				fs.writeFileSync(summary, error.stdout ?? '')
				metadata.summaryExitCode = error.status
			}
			metadata.runId = manifest.runId
		}
}

if (stage === 'chromium' || stage === 'webkit') {
	if (!fs.existsSync(testReport)) metadata.findings.push('Missing fresh Vitest test report')
	else {
		preserve(testReport, path.join(out, stage + '-tests.json'))
		const tests = JSON.parse(fs.readFileSync(testReport, 'utf8'))

		metadata.tests = Object.fromEntries(
			['numTotalTests', 'numPassedTests', 'numFailedTests', 'numPendingTests', 'success'].map(
				(key) => [key, tests[key]],
			),
		)
		if (
			!(tests.numTotalTests > 0) ||
			!tests.testResults?.length ||
			!Number.isFinite(tests.startTime) ||
			tests.startTime < Date.parse(metadata.started)
		)
			metadata.findings.push('Empty or stale Vitest test report')
	}
}

if (stage !== 'parity' && !metadata.runId) metadata.findings.push('Missing fresh axe run manifest')
if (metadata.summaryExitCode) metadata.findings.push('Axe inventory/summary validation failed')

write()
console.log(metadata.finished + ' END ' + stage + ' exit=' + metadata.exitCode)
if (metadata.exitCode !== 0 || metadata.findings.length) process.exitCode = 1
