import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '../..')
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
	outputs: [],
}

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
	for (const name of fs
		.readdirSync(path.join(root, 'tools/bench-pages/results'))
		.filter((name) => name.startsWith('parity-')))
		preserve(path.join(root, 'tools/bench-pages/results', name), path.join(out, 'parity', name))
} else {
	const axe = path.join(root, 'packages/playground/vue/.vitest/a11y', stage)

	if (fs.existsSync(axe))
		for (const name of fs
			.readdirSync(axe)
			.filter((name) => /^run-[a-f0-9-]+.json$/.test(name))) {
			const manifest = JSON.parse(fs.readFileSync(path.join(axe, name), 'utf8'))

			if (
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

write()
console.log(metadata.finished + ' END ' + stage + ' exit=' + metadata.exitCode)
if (metadata.exitCode !== 0) process.exitCode = 1
