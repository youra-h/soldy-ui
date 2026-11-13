import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { registry } from './registry.mjs'
import { auditData, frameworks } from './audit.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const [id, stage, framework, range] = process.argv.slice(2)

if (
	!/^[a-z0-9-]+$/.test(id ?? '') ||
	!frameworks.includes(framework) ||
	!['pages', 'replay', 'heap'].includes(stage)
)
	throw new Error('Expected ID, pages/replay/heap and framework')
const replayRange = (range ?? '').split('-').map(Number)
if (
	stage === 'replay' &&
	(!/^\d+-\d+$/.test(range ?? '') ||
		!replayRange.every((value) => Number.isSafeInteger(value) && value >= 0) ||
		replayRange[0] > replayRange[1])
)
	throw new Error('Expected ascending inclusive replay range')

const out = path.join(root, 'benchmarks/validation/runs', id)
const stem = stage + '-' + framework + (stage === 'replay' ? '-' + range : '')
const metadataFile = path.join(out, stem + '-command.json')
const rawName =
	stage === 'pages'
		? framework + '.json'
		: stage === 'heap'
			? 'heap-' + framework + '-avatar.json'
			: 'soak-replay-' + framework + '-' + range + '.json'
const source = path.join(root, 'tools/bench-pages/results', rawName)
const target = path.join(out, stem + '.json')

fs.mkdirSync(out, { recursive: true })
if (fs.existsSync(metadataFile) || fs.existsSync(target))
	throw new Error('Refusing to overwrite supplement evidence')

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const tree = (dir) =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(dir, entry.name)
		return entry.isDirectory() ? tree(file) : [file]
	})
const args =
	stage === 'pages'
		? [
				'tools/bench-pages/run.mjs',
				'--fw',
				framework,
				'--no-build',
				'--n',
				'50',
				'--act',
				'10',
				'--warm',
				'2',
				'--cycles',
				'20',
				'--rounds',
				'3',
				'--settle',
				'6000',
			]
		: stage === 'replay'
			? [
					'tools/bench-pages/soak.mjs',
					'--fw',
					framework,
					'--no-build',
					'--seed',
					'7',
					'--replay',
					range,
					'--n',
					'50',
					'--act',
					'10',
					'--warm',
					'2',
					'--cycles',
					'20',
					'--settle',
					'6000',
				]
			: [
					'--max-old-space-size=8192',
					'tools/bench-pages/heap.mjs',
					'--fw',
					framework,
					'--pages',
					'avatar',
					'--no-build',
					'--n',
					'50',
					'--warm',
					'2',
					'--top',
					'40',
				]
const dist = path.join(root, 'tools/bench-pages', stage === 'heap' ? 'dist-prof' : 'dist')
const tracked = git(
	'ls-files',
	'packages',
	'tools/bench-pages',
	'tools/bench-validation',
	'package.json',
	'package-lock.json',
).split('\n')
const metadata = {
	schemaVersion: 1,
	kind: 'single-framework-supplement',
	stage,
	framework,
	commit: git('rev-parse', 'HEAD'),
	dirtyState: git('status', '--porcelain'),
	executable: process.execPath,
	args,
	cwd: root,
	node: process.version,
	os: {
		platform: os.platform(),
		release: os.release(),
		cpu: os.cpus()[0]?.model,
		memory: os.totalmem(),
	},
	lockHash: hash(path.join(root, 'package-lock.json')),
	sourceHashes: Object.fromEntries(tracked.map((file) => [file, hash(path.join(root, file))])),
	buildHashes: Object.fromEntries(
		tree(dist).map((file) => [path.relative(root, file).replaceAll('\\', '/'), hash(file)]),
	),
	timingInterpretation:
		'Contextual timings; memory-only diagnostics may overlap. Do not rank adapters using this supplement.',
	outputs: [],
	findings: [],
}
const write = () => fs.writeFileSync(metadataFile, JSON.stringify(metadata) + '\n')
const expected = await registry(out)

fs.rmSync(source, { force: true })
metadata.started = new Date().toISOString()
write()
const logFile = path.join(out, stem + '.txt')
const log = fs.openSync(logFile, 'w')

console.log(metadata.started + ' START ' + stem)
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

if (!fs.existsSync(source)) metadata.findings.push('Missing fresh raw result')
else {
	fs.copyFileSync(source, target)
	const raw = JSON.parse(fs.readFileSync(target, 'utf8'))
	metadata.outputs.push({ file: path.basename(target), sha256: hash(target) })

	if (stage === 'pages') {
		const summary = auditData('pages', raw, { framework, expectedPages: expected[framework] })
		const summaryFile = path.join(out, stem + '-summary.json')

		fs.writeFileSync(summaryFile, JSON.stringify(summary) + '\n')
		metadata.findings.push(...summary.findings)
		metadata.outputs.push({ file: path.basename(summaryFile), sha256: hash(summaryFile) })
	} else if (stage === 'replay') {
		if (
			raw.errors?.length ||
			raw.seed !== 7 ||
			raw.from !== replayRange[0] ||
			raw.to !== replayRange[1] ||
			raw.transitions?.length !== replayRange[1] - replayRange[0] + 1 ||
			raw.after?.length !== 22 ||
			raw.cycles !== 20 ||
			raw.warm !== 2 ||
			raw.n !== 50 ||
			raw.act !== 10 ||
			!raw.before ||
			!raw.end
		)
			metadata.findings.push('Invalid or incomplete replay')
	} else if (
		raw.framework !== framework ||
		raw.page !== 'avatar' ||
		raw.n !== 50 ||
		!Number.isFinite(raw.total) ||
		!Number.isFinite(raw.js) ||
		!raw.groups?.length
	)
		metadata.findings.push('Invalid or incomplete heap result')
}
metadata.outputs.push({ file: path.basename(logFile), sha256: hash(logFile) })
write()
console.log(
	metadata.finished +
		' END ' +
		stem +
		' exit=' +
		metadata.exitCode +
		' findings=' +
		metadata.findings.length,
)
if (metadata.exitCode !== 0 || metadata.findings.length) process.exitCode = 1
