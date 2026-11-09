import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import crypto from 'node:crypto'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { build } from 'vite'
import { chromium, webkit } from 'playwright'
import {
	motionSummary,
	observeMotion,
	partitionAxe,
	parseFilters,
	annotateAxe,
} from './observations.mjs'
import { components } from './protocol.mjs'
import { auditEnvironment } from './environment.mjs'
import { renderDocument, DocumentIntegrationError } from './document.mjs'
import { waitForVisualSettling } from './settle.mjs'
import {
	scenario,
	ime,
	eventually,
	openForAudit,
	touchScenario,
	lastTableRecord,
	tableWidget,
	calendarTrigger,
} from './scenarios.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const stand = path.join(root, 'tools/bench-ai')
const [candidate = 'soxa', destination = 'benchmarks/ai/runs/local'] = process.argv.slice(2)
const filters = parseFilters(process.argv.slice(4))
const out = path.resolve(root, destination)
if (fs.existsSync(out)) throw new Error('Refusing to overwrite an earlier result')
fs.mkdirSync(out, { recursive: true })
const source = candidate === 'soxa' ? path.join(stand, 'Soxa.vue') : path.resolve(candidate)
const record = {
	schemaVersion: 2,
	filters,
	date: new Date().toISOString(),
	candidate,
	sourceHash: fs.existsSync(source)
		? crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')
		: null,
	status: 'pending',
	cells: [],
}
record.limits = {
	actionTimeoutMs: 10000,
	cellTimeoutMs: 120000,
	note: 'Common infrastructure completion bounds, not a comparative latency score',
}
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
record.commit = spawnSync('git', ['rev-parse', 'HEAD'], {
	cwd: root,
	encoding: 'utf8',
}).stdout.trim()
record.libraryDirtyState = spawnSync('git', ['status', '--porcelain', '--', 'packages'], {
	cwd: root,
	encoding: 'utf8',
}).stdout.trim()
record.node = process.version
record.os = {
	platform: os.platform(),
	release: os.release(),
	arch: os.arch(),
	cpu: os.cpus()[0]?.model,
}
record.lockHash = hash(path.join(root, 'package-lock.json'))
record.runtimeVersions = Object.fromEntries(
	['vue', 'vite', 'playwright', 'axe-core'].map((name) => {
		const file = path.join(root, 'node_modules', name, 'package.json')
		return [name, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)).version : null]
	}),
)
record.harnessSourceHashes = Object.fromEntries(
	fs
		.readdirSync(stand, { withFileTypes: true })
		.filter((entry) => entry.isFile() && /\.(mjs|ts|vue|html)$/.test(entry.name))
		.map((entry) => [`tools/bench-ai/${entry.name}`, hash(path.join(stand, entry.name))]),
)
const save = () =>
	fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(record, null, '\t') + '\n')
if (!fs.existsSync(source)) {
	record.status = 'not-run'
	record.reason = 'No candidate source input'
	save()
	process.exit(1)
}
if (candidate !== 'soxa') {
	try {
		const generated = JSON.parse(
			fs.readFileSync(path.join(path.dirname(source), 'manifest.json')),
		)
		if (generated.sourceHash !== record.sourceHash)
			throw new Error('Source hash differs from the untouched generation manifest')
	} catch (error) {
		record.status = 'invalid-input'
		record.reason = error.message
		save()
		process.exit(1)
	}
	record.environment = auditEnvironment(fs.readFileSync(source, 'utf8'), source)
	if (record.environment.status === 'protocol-violation') {
		record.status = 'protocol-violation'
		record.reason = 'Candidate imports outside the runtime declared before generation'
		save()
		process.exit(1)
	}
}
process.env.BENCH_CANDIDATE = source
try {
	await build({
		configFile: path.join(stand, 'vite.config.ts'),
		build: { outDir: path.join(out, 'dist') },
	})
	await build({
		configFile: path.join(stand, 'vite.config.ts'),
		build: { ssr: path.join(stand, 'server.mjs'), outDir: path.join(out, 'dist-ssr') },
	})
} catch (error) {
	record.status = 'compile-failed'
	record.error = error.message
	save()
	process.exit(1)
}
let render
try {
	;({ render } = await import(pathToFileURL(path.join(out, 'dist-ssr/server.js'))))
} catch (error) {
	record.status = 'runtime-failed'
	record.error = error.message
	save()
	process.exit(1)
}
const template = fs.readFileSync(path.join(out, 'dist/index.html'), 'utf8')
let axe
try {
	axe = fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8')
} catch {
	record.status = 'runner-failed'
	record.error = 'Missing axe-core dependency'
	save()
	process.exit(1)
}
const server = http.createServer(async (request, response) => {
	try {
		const url = new URL(request.url, 'http://localhost')
		if (url.pathname === '/') {
			const props = {
				component: url.searchParams.get('component') ?? 'select',
				baseline: candidate === 'soxa',
				locale: url.searchParams.get('locale') ?? 'en',
				dir: url.searchParams.get('dir') ?? 'ltr',
				count: Number(url.searchParams.get('count') ?? 20),
			}
			const renderStart = performance.now()
			const { html, teleports } = await render(props)
			response.setHeader('server-timing', `ssr;dur=${performance.now() - renderStart}`)
			response.setHeader('content-type', 'text/html; charset=utf-8')
			response.end(renderDocument(template, html, props, teleports))
		} else {
			const file = path.resolve(out, 'dist', '.' + url.pathname)
			if (!file.startsWith(path.join(out, 'dist') + path.sep) || !fs.existsSync(file)) {
				response.writeHead(404).end()
				return
			}
			response.setHeader(
				'content-type',
				file.endsWith('.css') ? 'text/css' : 'text/javascript',
			)
			response.end(fs.readFileSync(file))
		}
	} catch (error) {
		const infrastructure = error instanceof DocumentIntegrationError
		;(record.serverErrors ??= []).push({
			url: request.url,
			message: error.message,
			infrastructure,
		})
		if (infrastructure) {
			record.status = 'runner-failed'
			record.error = error.message
		}
		save()
		response.writeHead(500).end('SSR failed')
	}
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const hydrated = async (page) => {
	await page.waitForFunction(
		() => document.documentElement.dataset.benchHydrated === 'true',
		null,
		{ timeout: 10000 },
	)
	await page.evaluate(
		() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
	)
}
const selected =
	candidate === 'soxa'
		? components
		: [JSON.parse(fs.readFileSync(path.join(path.dirname(source), 'manifest.json'))).component]
try {
	for (const [engineName, engine] of [
		['chromium', chromium],
		['webkit', webkit],
	]) {
		if (filters.engine && filters.engine !== engineName) continue
		let browser
		if (engineName === 'webkit' && process.platform === 'win32') {
			record.cells.push({
				engine: engineName,
				status: 'not-run',
				reason: 'Playwright WebKit requires Linux/container on Windows; run this harness on Linux CI',
			})
			continue
		}
		try {
			browser = await engine.launch()
		} catch (error) {
			record.cells.push({
				engine: engineName,
				status: 'not-run',
				reason:
					process.platform === 'win32' && engineName === 'webkit'
						? 'Playwright WebKit requires Linux/container on Windows; see playground AGENTS.md'
						: error.message,
			})
			continue
		}
		try {
			for (const component of selected)
				for (const mode of [
					'default',
					'rtl',
					'narrow-touch',
					'reduce',
					...(component === 'select' ? ['ime'] : []),
					...(['table', 'select'].includes(component) ? ['large'] : []),
				]) {
					if (filters.component && filters.component !== component) continue
					if (filters.mode && filters.mode !== mode) continue
					if (engineName === 'webkit' && mode === 'ime') {
						record.cells.push({
							engine: engineName,
							component,
							mode,
							status: 'not-applicable',
							reason: 'Real IME composition uses the Chromium CDP helper; no equivalent covered here for WebKit',
						})
						continue
					}
					const errors = []
					const page = await browser.newPage({
						viewport: { width: mode === 'narrow-touch' ? 360 : 1440, height: 900 },
						hasTouch: mode === 'narrow-touch',
						reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
					})
					page.setDefaultTimeout(record.limits.actionTimeoutMs)
					page.on('console', (m) => {
						if (['error', 'warning'].includes(m.type())) errors.push(m.text())
					})
					page.on('pageerror', (error) => errors.push(error.message))
					const url = `${base}/?component=${component}&locale=${mode === 'rtl' ? 'ar' : 'en'}&dir=${mode === 'rtl' ? 'rtl' : 'ltr'}&count=${mode === 'large' ? 10000 : 20}`
					const cell = {
						engine: engineName,
						browser: browser.version(),
						component,
						mode,
						status: 'failed',
						errors,
					}
					record.cells.push(cell)
					cell.stages = []
					const phase = async (name, operation) => {
						cell.lastStage = name
						const entry = { name, status: 'running' }
						cell.stages.push(entry)
						save()
						const started = performance.now()
						try {
							const result = await operation()
							entry.status = 'completed'
							return result
						} catch (error) {
							entry.status = 'failed'
							entry.error = error.message
							throw error
						} finally {
							entry.durationMs = performance.now() - started
							save()
						}
					}
					const timeout = setTimeout(() => {
						cell.timedOut = true
						page.close().catch(() => {})
					}, record.limits.cellTimeoutMs)
					const scan = async (state) => {
						const settling = await phase(`settling-${state}`, () =>
							waitForVisualSettling(page, record.limits.actionTimeoutMs),
						)
						await page.addScriptTag({ content: axe })
						let result = await phase(`audit-${state}`, () =>
							page.evaluate(async () => {
								const result = await window.axe.run()
								return {
									violations: result.violations,
									incomplete: result.incomplete.map((r) => ({
										id: r.id,
										impact: r.impact,
									})),
								}
							}),
						)
						result = await page.evaluate(annotateAxe, result)
						;(cell.axe ??= {})[state] = { ...partitionAxe(result), settling }
					}
					const motion = async (state) => {
						if (mode !== 'reduce') return
						const observation = motionSummary(await page.evaluate(observeMotion))
						cell.reducedMotion ??= { status: 'passed-observed-states', states: {} }
						cell.reducedMotion.states[state] = observation
						if (observation.status === 'movement-observed')
							cell.reducedMotion.status = 'failed'
						else if (
							observation.status === 'incomplete' &&
							cell.reducedMotion.status !== 'failed'
						)
							cell.reducedMotion.status = 'incomplete'
					}
					try {
						const response = await phase('ssr-request', () =>
							page.request.get(url, {
								timeout: record.limits.actionTimeoutMs,
							}),
						)
						cell.serverTiming = response.headers()['server-timing']
						if (response.status() !== 200)
							throw new Error(`SSR HTTP ${response.status()}`)
						const html = await response.text()
						const htmlFile = `${engineName}-${component}-${mode}.html.txt`
						fs.writeFileSync(path.join(out, htmlFile), html)
						cell.ssrHtml = {
							file: htmlFile,
							sha256: crypto.createHash('sha256').update(html).digest('hex'),
						}
						const staticPage = await browser.newPage({ javaScriptEnabled: false })
						staticPage.setDefaultTimeout(record.limits.actionTimeoutMs)
						try {
							await phase('static-navigation', () => staticPage.goto(url))
							if (component === 'select')
								await staticPage
									.getByRole('combobox', { name: 'Choose items' })
									.waitFor({ state: 'visible' })
							if (component === 'dialog')
								await staticPage
									.getByRole('button', { name: 'Open dialog', exact: true })
									.waitFor({ state: 'visible' })
							if (component === 'date-picker')
								await calendarTrigger(staticPage).waitFor({ state: 'visible' })
							if (
								component === 'tabs' &&
								(await staticPage.getByRole('tab').count()) !== 3
							)
								throw new Error('SSR did not render three tabs')
							if (component === 'table')
								await tableWidget(staticPage)
									.getByRole('row')
									.nth(1)
									.waitFor({ state: 'visible' })
							cell.ssr = {
								status: 'passed',
								snapshot: await phase('static-accessibility-snapshot', () =>
									staticPage.locator('body').ariaSnapshot(),
								),
							}
						} finally {
							await staticPage.close()
						}
						await phase('navigation', () => page.goto(url))
						await page.getByRole('heading', { name: 'Component validation' }).waitFor()
						await phase('hydration', () => hydrated(page))
						cell.before = await phase('accessibility-snapshot', () =>
							page.locator('body').ariaSnapshot(),
						)
						await motion('initial')
						await scan('initial')
						try {
							await openForAudit(component, page)
							await motion('open')
							await scan('open')
						} catch (error) {
							cell.openStateFailure = error.message
						}
						await phase('navigation', () => page.goto(url))
						await phase('hydration', () => hydrated(page))
						if (mode === 'narrow-touch') {
							await phase('touch-scenario', () => touchScenario(component, page))
							cell.touch = 'passed'
							await phase('navigation', () => page.goto(url))
							await phase('hydration', () => hydrated(page))
						}
						if (mode === 'ime') await phase('ime-scenario', () => ime(page))
						else if (mode === 'rtl' && component === 'tabs') {
							const tabs = page.getByRole('tab')
							await tabs.first().focus()
							await page.keyboard.press('ArrowLeft')
							await eventually(
								async () =>
									(await tabs.nth(1).getAttribute('aria-selected')) === 'true',
								'RTL ArrowLeft must activate next tab',
							)
						} else
							await phase('behavior-scenario', () =>
								scenario(
									component,
									page,
									mode === 'large' && component === 'select' ? 10000 : 100,
								),
							)
						if (mode === 'narrow-touch') {
							const overflow = await page.evaluate(
								() => document.documentElement.scrollWidth > innerWidth,
							)
							if (overflow && component !== 'table')
								throw new Error('Narrow viewport overflows horizontally')
						}
						if (mode === 'large' && component === 'table')
							await phase('large-table-boundary', () => lastTableRecord(page))
						await motion('after')
						if (cell.reducedMotion?.status === 'failed')
							throw new Error(
								'Reduced-motion spatial movement detected in an observed state',
							)
						await scan('after')
						cell.after = await phase('accessibility-snapshot', () =>
							page.locator('body').ariaSnapshot(),
						)
						if (
							Object.values(cell.axe).some(
								(result) =>
									result.wcag.length ||
									result.bestPractice.some(
										(v) => !result.documentIntegration.includes(v),
									),
							)
						)
							throw new Error('axe violations in recorded states')
						if (cell.openStateFailure) throw new Error('Open-state coverage failed')
						if (errors.length) throw new Error('Console/page/hydration errors')
						cell.status = 'passed'
					} catch (error) {
						cell.failure = cell.timedOut
							? `Cell exceeded ${record.limits.cellTimeoutMs} ms`
							: error.message
					} finally {
						clearTimeout(timeout)
					}

					await page.close()
					save()
				}
		} finally {
			await browser.close()
		}
	}
} catch (error) {
	record.status = 'runner-failed'
	record.error = error.message
	save()
	process.exitCode = 1
} finally {
	await new Promise((resolve) => server.close(resolve))
}
record.manualScreenReader = {
	status: 'not-run',
	reason: 'axe and ariaSnapshot do not prove audible NVDA/VoiceOver announcements',
}
if (record.status !== 'runner-failed')
	record.status = record.cells.some((c) => c.status === 'failed')
		? 'tested-with-failures'
		: 'tested-with-gaps'
save()
if (record.cells.some((c) => c.status === 'failed')) process.exitCode = 1
