import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'
import { serve } from '../../../../tools/bench-pages/serve.mjs'
const root = path.resolve(import.meta.dirname, '../../../..'),
	out = import.meta.dirname,
	file = path.join(out, 'avatar-contrast.json')
if (fs.existsSync(file)) throw new Error('Existing contrast evidence')
const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')
const files = (dir) =>
	fs
		.readdirSync(dir, { withFileTypes: true })
		.flatMap((e) =>
			e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)],
		)
const result = {
	schemaVersion: 1,
	started: new Date().toISOString(),
	commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
	collectorHash: hash(import.meta.filename),
	command: [process.execPath, ...process.argv.slice(1)],
	buildHashes: Object.fromEntries(
		files(path.join(root, 'tools/bench-pages/dist')).map((f) => [
			path.relative(root, f).replaceAll('\\', '/'),
			hash(f),
		]),
	),
	method: 'Neutral Avatar named/error/fallback and group children/overflow actual computed foreground over opaque composed CSS background. Same canvas and WCAG2 sRGB calculation as browser/colors.ts. All ancestor opacity values must be one; only constant-color gradients accepted. This is a supplementary visual contrast review, not an axe waiver or AT test.',
	cases: [],
	errors: [],
}
const write = () => fs.writeFileSync(file, JSON.stringify(result) + '\n')
const { server, base } = serve()
try {
	for (const host of ['vue', 'react', 'angular', 'svelte', 'solid', 'webc']) {
		const browser = await chromium.launch(),
			page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
		page.on('pageerror', (e) => result.errors.push({ host, message: e.message }))
		const record = async (label) => {
			const data = await page.evaluate(() => {
				const selectors = ['.so-avatar__fallback', '.so-avatar-group__count']
				const targets = selectors
					.flatMap((selector) =>
						[...document.querySelectorAll(selector)].map((node, index) => ({
							node,
							selector,
							index,
						})),
					)
					.filter(({ node }) => {
						const rect = node.getBoundingClientRect()
						return (
							rect.width > 0 &&
							rect.height > 0 &&
							getComputedStyle(node).visibility !== 'hidden'
						)
					})
				const canvas = document.createElement('canvas'),
					paint = canvas.getContext('2d', { willReadFrequently: true })
				if (!paint) throw new Error('Missing contrast canvas')
				const pixel = (colors) => {
					paint.clearRect(0, 0, 1, 1)
					for (const c of colors) {
						if (!CSS.supports('color', c))
							throw new Error('Invalid computed color ' + c)
						paint.fillStyle = c
						paint.fillRect(0, 0, 1, 1)
					}
					return [...paint.getImageData(0, 0, 1, 1).data]
				}
				const linear = (c) => {
					const s = c / 255
					return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
				}
				const luminance = (colors) => {
					const [r, g, b, a] = pixel(colors)
					if (a !== 255) throw new Error('Nonopaque backdrop')
					return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
				}
				return targets.map(({ node, selector, index }) => {
					const ancestors = []
					for (let el = node; el; el = el.parentElement) ancestors.unshift(el)
					const layers = [],
						styles = []
					for (const el of ancestors) {
						const style = getComputedStyle(el)
						if (style.opacity !== '1')
							throw new Error('Ancestor opacity requires manual review')
						layers.push(style.backgroundColor)
						styles.push({
							tag: el.tagName,
							class: el.className,
							background: style.backgroundColor,
							image: style.backgroundImage,
							opacity: style.opacity,
						})
						if (style.backgroundImage !== 'none') {
							const colors = style.backgroundImage.match(
								/(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g,
							)
							if (!colors?.length || new Set(colors).size !== 1)
								throw new Error(
									'Unsupported varying gradient ' + style.backgroundImage,
								)
							layers.push(colors[0])
						}
					}
					const foreground = getComputedStyle(node).color,
						front = luminance([...layers, foreground]),
						back = luminance(layers)
					return {
						selector,
						index,
						text: node.textContent,
						foreground,
						layers,
						foregroundPixel: pixel([...layers, foreground]),
						backgroundPixel: pixel(layers),
						ratio: (Math.max(front, back) + 0.05) / (Math.min(front, back) + 0.05),
						styles,
					}
				})
			})
			result.cases.push({
				host,
				scheme: await page.evaluate(() => document.documentElement.dataset.soTheme),
				label,
				browser: browser.version(),
				nodes: data,
			})
		}
		try {
			await page.exposeFunction('parityStep', record)
			await page.goto(base + '?fw=' + host)
			await page.waitForFunction(() => 'bench' in window)
			await page.evaluate(() => bench.observe())
			for (const scheme of ['oren', 'oren-dark']) {
				await page.evaluate((s) => (document.documentElement.dataset.soTheme = s), scheme)
				for (const component of ['avatar', 'avatar-group']) {
					await page.evaluate((id) => bench.record(id), component)
					await page.evaluate(() => bench.settle())
					await record(component + ' mount')
					await page.evaluate((id) => bench.scenario(id, 1), component)
					await page.evaluate(() => bench.unmount())
				}
			}
		} catch (e) {
			result.errors.push({ host, message: String(e.stack ?? e) })
		} finally {
			await browser.close()
			write()
		}
	}
} finally {
	server.close()
	result.finished = new Date().toISOString()
	result.nodeChecks = result.cases.reduce((sum, c) => sum + c.nodes.length, 0)
	result.minimumRatio = Math.min(...result.cases.flatMap((c) => c.nodes.map((n) => n.ratio)))
	result.valid =
		result.errors.length === 0 &&
		result.cases.length === 96 &&
		result.nodeChecks > 0 &&
		result.minimumRatio >= 4.5
	write()
}
console.log(
	JSON.stringify({
		valid: result.valid,
		cases: result.cases.length,
		nodeChecks: result.nodeChecks,
		minimumRatio: result.minimumRatio,
		errors: result.errors,
	}),
)
if (!result.valid) process.exitCode = 1
