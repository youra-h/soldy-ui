import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import { serve } from '../bench-pages/serve.mjs'
import { auditedPages, frameworks } from './audit.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const [id] = process.argv.slice(2)
if (!/^[a-z0-9-]+$/.test(id ?? '')) throw new Error('Expected evidence run ID')
const out = path.join(root, 'benchmarks/validation/runs', id)
const file = path.join(out, 'page-update-preflight.json')
fs.mkdirSync(out, { recursive: true })
if (fs.existsSync(file)) throw new Error('Refusing to overwrite preflight evidence')
const previousRegistry = path.join(
	root,
	'benchmarks/validation/runs/audit-new-components-20261113/registry.json',
)
const expected = JSON.parse(fs.readFileSync(previousRegistry, 'utf8')).pages
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const files = (directory) =>
	fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(directory, entry.name)
		return entry.isDirectory() ? files(file) : [file]
	})
const buildHashes = Object.fromEntries(
	files(path.join(root, 'tools/bench-pages/dist')).map((file) => [
		path.relative(root, file).replaceAll('\\', '/'),
		hash(file),
	]),
)
const sourceHashes = Object.fromEntries(
	[
		'tools/bench-pages/bench.ts',
		'tools/bench-pages/scenarios.ts',
		'tools/bench-pages/measure.mjs',
		'tools/bench-table/heap-group.mjs',
	].map((file) => [file, hash(path.join(root, file))]),
)

const result = {
	sourceHashes,
	buildHashes,
	schemaVersion: 1,
	started: new Date().toISOString(),
	commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
	dirtyState: execFileSync('git', ['status', '--porcelain'], {
		cwd: root,
		encoding: 'utf8',
	}).trim(),
	collectorHash: hash(import.meta.filename),
	expectedRegistryHash: hash(previousRegistry),
	note: 'Functional harness preflight, not a timing benchmark. Unsupported non-audited prop writes are not attempted.',
	frameworks: [],
	errors: [],
}
const { server, base } = serve()
try {
	for (const framework of frameworks) {
		const browser = await chromium.launch()
		try {
			const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
			page.on('pageerror', (error) =>
				result.errors.push({ framework, message: error.message }),
			)
			page.on('console', (message) => {
				if (['error', 'warning'].includes(message.type()))
					result.errors.push({ framework, message: message.text() })
			})
			await page.goto(base + '?fw=' + framework)
			await page.waitForFunction(() => 'bench' in window)
			const pages = await page.evaluate(() => bench.pages)
			if (
				JSON.stringify(pages) !== JSON.stringify(expected[framework]) ||
				!auditedPages.every((id) => pages.includes(id))
			)
				throw new Error('Incomplete compiled registry: ' + framework)
			const data = { framework, browser: browser.version(), pages: [] }
			result.frameworks.push(data)

			for (const id of [...pages, 'all', 'empty', 'leak']) {
				await page.evaluate((id) => bench.mount(id, 2), id)
				try {
					const duration = await page.evaluate((id) => bench.update(id), id)
					if (!Number.isFinite(duration) || duration < 0)
						throw new Error('Invalid update result: ' + id)
					const actions = auditedPages.includes(id)
						? await page.evaluate((id) => bench.scenario(id, 1), id)
						: null
					if (auditedPages.includes(id) && !(actions > 0))
						throw new Error('No audited actions: ' + id)
					data.pages.push({ id, updateCallSucceeded: true, actions })
				} finally {
					await page.evaluate(() => bench.unmount())
				}
			}
		} catch (error) {
			result.errors.push({ framework, message: String(error.stack ?? error) })
		} finally {
			await browser.close()
		}
	}
} finally {
	server.close()
	result.finished = new Date().toISOString()
	result.valid = result.errors.length === 0 && result.frameworks.length === frameworks.length
	fs.writeFileSync(file, JSON.stringify(result) + '\n')
}
console.log(
	JSON.stringify({
		valid: result.valid,
		frameworks: result.frameworks.map((entry) => ({
			framework: entry.framework,
			pages: entry.pages.length,
		})),
		errors: result.errors,
	}),
)
if (!result.valid) process.exitCode = 1
