import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawnSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { registry } from './registry.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const frameworks = ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']
const exec = (args) => {
	const result = spawnSync(args[0], args.slice(1), { cwd: root, encoding: 'utf8' })
	if (result.error || result.status !== 0)
		throw new Error(
			`Metadata command failed: ${args[0]} (${result.error?.code ?? result.status})`,
		)
	return result.stdout.trim()
}
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data) + '\n')
const tree = (directory) =>
	fs.existsSync(directory)
		? fs
				.readdirSync(directory, { withFileTypes: true })
				.flatMap((entry) =>
					entry.isDirectory()
						? tree(path.join(directory, entry.name))
						: [path.join(directory, entry.name)],
				)
		: []

export async function run({ id, stages, smoke = false }) {
	if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id))
		throw new Error('Run ID must contain lowercase letters, digits and hyphens')
	const out = path.join(root, 'benchmarks/validation/runs', id)
	fs.mkdirSync(out, { recursive: true })
	const manifestFile = path.join(out, 'manifest.json')
	const manifest = fs.existsSync(manifestFile)
		? JSON.parse(fs.readFileSync(manifestFile))
		: {
				schemaVersion: 1,
				id,
				started: new Date().toISOString(),
				smoke,
				commit: exec(['git', 'rev-parse', 'HEAD']),
				dirtyState: exec(['git', 'status', '--porcelain']),
				node: process.version,
				npm: exec([
					process.execPath,
					path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
					'--version',
				]),
				os: {
					platform: os.platform(),
					release: os.release(),
					arch: os.arch(),
					cpu: os.cpus()[0]?.model,
					cores: os.cpus().length,
					totalMemory: os.totalmem(),
				},
				lockHash: hash(path.join(root, 'package-lock.json')),
				versions: Object.fromEntries(
					[
						'vue',
						'react',
						'@angular/core',
						'svelte',
						'solid-js',
						'playwright',
						'vite',
					].map((name) => [
						name,
						JSON.parse(
							fs.readFileSync(path.join(root, 'node_modules', name, 'package.json')),
						).version,
					]),
				),
				sourceHashes: {},
				commands: [],
				memory: 'Post-GC JS heap and object/DOM counters, not total process RSS; table MB uses the existing decimal rounding.',
			}
	const tracked = exec([
		'git',
		'ls-files',
		'tools/bench-pages',
		'tools/bench-table',
		'tools/bench-ssr',
		'packages',
		'package.json',
		'package-lock.json',
	]).split('\n')
	if (!Object.keys(manifest.sourceHashes).length)
		for (const file of [...tracked, 'tools/bench-validation/run.mjs'])
			manifest.sourceHashes[file] = hash(path.join(root, file))
	const browser = await chromium.launch()
	manifest.browser = browser.version()
	manifest.npm ??= exec([
		process.execPath,
		path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
		'--version',
	])
	manifest.libraryVersions ??= Object.fromEntries(
		[
			'packages/core',
			'packages/setup',
			'packages/plugins',
			...frameworks.map((fw) => `packages/ui/${fw}`),
			'packages/themes/base',
			'packages/themes/oren',
			'packages/icons/material',
		].map((directory) => {
			const pkg = JSON.parse(
				fs.readFileSync(path.join(root, directory, 'package.json'), 'utf8'),
			)
			return [
				pkg.name,
				{
					version: pkg.version,
					consumption: 'repository source',
					manifest: `${directory}/package.json`,
				},
			]
		}),
	)
	await browser.close()
	write(manifestFile, manifest)
	if (!fs.existsSync(path.join(out, 'registry.json'))) await registry(out)

	async function command(name, args, sources = [], cwd = root, env = {}) {
		if (manifest.commands.some((entry) => entry.name === name))
			throw new Error(`Refusing to overwrite ${name}; use another run ID`)
		const sourceHashes = Object.fromEntries(
			[
				...tracked,
				...tree(path.join(root, 'tools/bench-validation'))
					.filter((f) => !f.includes('__tests__'))
					.map((f) => path.relative(root, f)),
			].map((file) => [file.replaceAll('\\', '/'), hash(path.join(root, file))]),
		)
		const buildFiles = [
			'tools/bench-pages/dist',
			'tools/bench-pages/dist-count',
			'tools/bench-table/dist',
			'tools/bench-ssr/dist',
		].flatMap((dir) => tree(path.join(root, dir)))
		const buildHashes = Object.fromEntries(
			buildFiles.map((file) => [path.relative(root, file).replaceAll('\\', '/'), hash(file)]),
		)
		const snapshot = {
			sourceHashes,
			buildHashes,
			lockHash: hash(path.join(root, 'package-lock.json')),
		}
		const tableLock = path.join(root, 'tools/bench-table/package-lock.json')
		if (fs.existsSync(tableLock)) snapshot.tableLockHash = hash(tableLock)
		const snapshotName = `snapshot-${crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex').slice(0, 16)}.json`
		if (!fs.existsSync(path.join(out, snapshotName)))
			write(path.join(out, snapshotName), snapshot)
		const record = {
			name,
			repositoryCommit: exec(['git', 'rev-parse', 'HEAD']),
			executable: process.execPath,
			args,
			cwd: path.relative(root, cwd).replaceAll('\\', '/'),
			snapshot: snapshotName,
			started: new Date().toISOString(),
			outputs: [],
		}
		if (name.startsWith('table-') || name.startsWith('virtual-')) {
			const require = createRequire(path.join(root, 'tools/bench-table/package.json'))
			record.runtimeVersions = Object.fromEntries(
				['vue', 'react', '@angular/core', 'svelte', 'solid-js'].map((name) => [
					name,
					JSON.parse(fs.readFileSync(require.resolve(`${name}/package.json`), 'utf8'))
						.version,
				]),
			)
		}
		for (const [source] of sources) fs.rmSync(path.join(root, source), { force: true })
		manifest.commands.push(record)
		write(manifestFile, manifest)
		const log = fs.openSync(path.join(out, `${name}.txt`), 'w')
		console.log(`${record.started} START ${name}`)
		const code = await new Promise((resolve) => {
			const child = spawn(process.execPath, args, {
				cwd,
				env: { ...process.env, ...env },
				stdio: ['ignore', log, log],
			})
			record.pid = child.pid
			const timeoutMs =
				(name.startsWith('pages-')
					? 120
					: name === 'soak'
						? 45
						: name.startsWith('table-') || name.startsWith('virtual-')
							? 12
							: 45) * 60000
			const timeout = setTimeout(() => {
				record.timedOut = true
				if (process.platform === 'win32' && child.pid)
					spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'])
				else child.kill('SIGTERM')
			}, timeoutMs)
			child.once('error', (error) => {
				clearTimeout(timeout)
				record.spawnError = error.code
				resolve(127)
			})
			child.once('exit', (code, signal) => {
				clearTimeout(timeout)
				record.signal = signal
				resolve(code)
			})
		}).finally(() => fs.closeSync(log))
		record.exitCode = code
		record.finished = new Date().toISOString()
		for (const [source, destination] of sources) {
			if (!fs.existsSync(path.join(root, source))) {
				record.outputs.push({ file: destination, missing: true })
				continue
			}
			const originalHash = hash(path.join(root, source))
			let invalidJSON = false
			try {
				write(
					path.join(out, destination),
					JSON.parse(fs.readFileSync(path.join(root, source), 'utf8')),
				)
			} catch {
				fs.copyFileSync(path.join(root, source), path.join(out, destination))
				invalidJSON = true
			}
			record.outputs.push({
				file: destination,
				sha256: hash(path.join(out, destination)),
				originalHash,
				invalidJSON,
			})
		}
		write(manifestFile, manifest)
		console.log(`${record.finished} END ${name} exit=${code} outputs=${record.outputs.length}`)
	}
	const pageSource = (fw, prefix = '') => `tools/bench-pages/results/${prefix}${fw}.json`
	for (const stage of stages) {
		if (stage === 'pages') {
			for (const fw of frameworks) {
				const args = [
					'tools/bench-pages/run.mjs',
					'--fw',
					fw,
					'--no-build',
					'--n',
					smoke ? '2' : '50',
					'--act',
					smoke ? '1' : '10',
					'--warm',
					smoke ? '1' : '2',
					'--cycles',
					smoke ? '2' : '20',
					'--rounds',
					smoke ? '1' : '3',
					'--settle',
					smoke ? '100' : '6000',
				]
				if (smoke) args.push('--pages', 'empty,button,leak')
				await command(`pages-${fw}`, args, [[pageSource(fw), `pages-${fw}.json`]])
			}
		} else if (stage === 'soak' || stage === 'control') {
			const prefix = stage === 'control' ? 'control-' : 'soak-'
			const args = [
				'tools/bench-pages/soak.mjs',
				'--fw',
				frameworks.join(','),
				'--no-build',
				'--seed',
				'7',
				'--minutes',
				smoke ? '0.1' : stage === 'control' ? '1' : '30',
				'--every',
				stage === 'control' || smoke ? '5' : '50',
			]
			if (stage === 'control') args.push('--pages', 'leak')
			if (smoke) args.push('--n', '2', '--act', '1', '--settle', '100')
			await command(
				stage,
				args,
				frameworks.map((fw) => [pageSource(fw, 'soak-'), `${prefix}${fw}.json`]),
			)
		} else if (stage === 'interaction') {
			for (const fw of frameworks) {
				const args = [
					'tools/bench-pages/interaction.mjs',
					'--fw',
					fw,
					'--no-build',
					'--n',
					smoke ? '2' : '50',
					'--rates',
					smoke ? '1' : '1,4,6',
					'--warm',
					smoke ? '1' : '2',
					'--reps',
					smoke ? '1' : '10',
					'--count-reps',
					smoke ? '1' : '3',
				]
				await command(`interaction-${fw}`, args, [
					[pageSource(fw, 'interaction-'), `interaction-${fw}.json`],
				])
			}
		} else if (stage === 'ssr') {
			for (const fw of frameworks.filter((fw) => fw !== 'webc')) {
				await command(
					`ssr-${fw}`,
					[
						'tools/bench-ssr/run.mjs',
						'--fw',
						fw,
						'--no-build',
						'--renders',
						smoke ? '18' : '3000',
						'--warm',
						smoke ? '6' : '600',
						'--every',
						smoke ? '3' : '150',
						'--leak-renders',
						smoke ? '18' : '600',
						'--leak-warm',
						smoke ? '6' : '150',
						'--settle',
						smoke ? '100' : '3000',
					],
					[[`tools/bench-ssr/results/${fw}.json`, `ssr-${fw}.json`]],
				)
			}
		} else if (stage === 'table' || stage === 'virtual') {
			for (const fw of frameworks) {
				const lib = `${fw === 'vue' ? '' : fw + ':'}soxa+fit=none+width=3248+track${stage === 'virtual' ? '+virtual' : ''}`
				const source = `tools/bench-table/results/validation-${fw}.json`
				await command(
					`${stage}-${fw}`,
					[
						'tools/bench-table/run.mjs',
						smoke ? '20' : stage === 'virtual' ? '10000' : '5000',
						smoke ? '1' : '3',
						lib,
					],
					[[source, `${stage}-${fw}.json`]],
					root,
					{ BENCH_JSON_OUT: path.join(root, source) },
				)
			}
		} else throw new Error(`Unknown stage: ${stage}`)
	}
	manifest.finished = new Date().toISOString()
	write(manifestFile, manifest)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [id, selected = 'pages,soak,control,interaction,table,virtual,ssr'] =
		process.argv.slice(2)
	await run({ id, stages: selected.split(','), smoke: process.argv.includes('--smoke') })
}
