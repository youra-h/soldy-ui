import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { open, slope } from '../bench-pages/measure.mjs'
import { serve } from '../bench-pages/serve.mjs'
import { group } from '../bench-table/heap-group.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const [id] = process.argv.slice(2)
if (!/^[a-z0-9-]+$/.test(id ?? '')) throw new Error('Expected evidence run ID')
const out = path.join(root, 'benchmarks/validation/runs', id)
const output = path.join(out, 'avatar-controls.json')
fs.mkdirSync(out, { recursive: true })
if (fs.existsSync(output)) throw new Error('Refusing to overwrite memory controls')
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
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
	commit: git('rev-parse', 'HEAD'),
	dirtyState: git('status', '--porcelain'),
	started: new Date().toISOString(),
	command: [process.execPath, ...process.argv.slice(1)],
	node: process.version,
	platform: process.platform,
	collectorHash: hash(import.meta.filename),
	lockHash: hash(path.join(root, 'package-lock.json')),
	n: 50,
	warm: 2,
	cycles: 20,
	settle: 6000,
	note: 'Memory-only controls may overlap Angular full pages; timings are not compared. Each case has its own browser.',
	cases: [],
	outputs: [],
}
const write = () => fs.writeFileSync(output, JSON.stringify(result) + '\n')
const { server, base } = serve()
const counters = ['heap', 'nodes', 'listeners', 'components', 'emitters']

/** Preserve the actual post-churn heap, not a snapshot of an untouched fallback. */
async function snapshot(page, name) {
	const cdp = await page.context().newCDPSession(page)
	await cdp.send('HeapProfiler.collectGarbage')
	await cdp.send('HeapProfiler.collectGarbage')
	const chunks = []
	const receive = ({ chunk }) => chunks.push(chunk)
	cdp.on('HeapProfiler.addHeapSnapshotChunk', receive)
	await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false })
	cdp.off('HeapProfiler.addHeapSnapshotChunk', receive)
	await cdp.detach()
	const text = chunks.join('')
	const file = path.join(out, name + '.heapsnapshot.gz')
	fs.writeFileSync(file, gzipSync(text))
	result.outputs.push({
		file: path.basename(file),
		sha256: hash(file),
		encoding: 'gzip; decompress to Chrome DevTools .heapsnapshot',
	})
	const heap = JSON.parse(text)
	const groups = [...group(heap).groups].map(([name, value]) => ({ name, ...value }))
	const meta = heap.snapshot.meta
	const width = meta.node_fields.length
	const edgeWidth = meta.edge_fields.length
	const typeAt = meta.node_fields.indexOf('type')
	const nameAt = meta.node_fields.indexOf('name')
	const edgesAt = meta.node_fields.indexOf('edge_count')
	const typeNames = meta.node_types[typeAt]
	const edgeTypes = meta.edge_types[meta.edge_fields.indexOf('type')]
	const toAt = meta.edge_fields.indexOf('to_node')
	const labelAt = meta.edge_fields.indexOf('name_or_index')
	const incoming = new Map()
	const interesting = []
	let edge = 0
	const describe = (at) => ({
		type: typeNames[heap.nodes[at + typeAt]],
		name: heap.strings[heap.nodes[at + nameAt]],
	})

	for (let at = 0; at < heap.nodes.length; at += width) {
		const node = describe(at)
		if (node.type === 'native' && /Document|SVG|HTMLImageElement/.test(node.name))
			interesting.push(at)
		for (let index = 0; index < heap.nodes[at + edgesAt]; index++, edge += edgeWidth) {
			const type = edgeTypes[heap.edges[edge]]
			if (type === 'weak') continue
			const to = heap.edges[edge + toAt]
			const label =
				type === 'element' || type === 'hidden'
					? String(heap.edges[edge + labelAt])
					: heap.strings[heap.edges[edge + labelAt]]
			const entries = incoming.get(to) ?? []
			entries.push({ from: at, type, label })
			incoming.set(to, entries)
		}
	}
	const retainers = interesting.slice(-24).map((target) => {
		const queue = [{ at: target, path: [describe(target)] }]
		const seen = new Set()
		for (let cursor = 0; cursor < queue.length && cursor < 20000; cursor++) {
			const item = queue[cursor]
			if (seen.has(item.at)) continue
			seen.add(item.at)
			const parents = incoming.get(item.at) ?? []
			if (item.at === 0 || !parents.length)
				return {
					target: describe(target),
					chain: item.path,
					termination: item.at === 0 ? 'gc-root' : 'no-recorded-strong-parent',
				}
			if (item.path.length >= 16) continue
			for (const parent of parents.slice(0, 40))
				queue.push({
					at: parent.from,
					path: [
						...item.path,
						{ ...describe(parent.from), edgeType: parent.type, edge: parent.label },
					],
				})
		}
		return {
			target: describe(target),
			note: 'No root chain within bounded strong-edge traversal; inspect the preserved heap.',
		}
	})
	return { file: path.basename(file), groups, retainers }
}

async function churn(page, variant) {
	return page.evaluate(
		async ({ variant, n }) => {
			if (variant === 'exact-scenario') {
				await bench.mount('avatar', n)
				const actions = await bench.scenario('avatar', 10)
				await bench.unmount()
				return { actions }
			}
			const svg =
				'data:image/svg+xml,' +
				encodeURIComponent(
					'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="teal"/></svg>',
				)
			let source = svg
			if (variant.includes('png')) {
				const raster = document.createElement('canvas')
				raster.width = raster.height = 8
				const paint = raster.getContext('2d')
				if (!paint) throw new Error('Missing raster control canvas')
				paint.fillStyle = 'teal'
				paint.fillRect(0, 0, 8, 8)
				source = raster.toDataURL('image/png')
			}
			const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))
			const until = async (check) => {
				const end = performance.now() + 5000
				while (!check()) {
					if (performance.now() > end)
						throw new Error('Image control state timed out: ' + variant)
					await frame()
				}
			}
			const native = variant.startsWith('native')
			let roots
			if (native) {
				roots = Array.from({ length: n }, () => {
					const root = document.createElement('span')
					root.className = 'native-avatar-control'
					document.body.append(root)
					return root
				})
			} else {
				await bench.mount('avatar', n)
				roots = [...document.querySelectorAll('.bench-page .so-avatar')]
				if (roots.length !== n) throw new Error('Wrong Avatar copy count')
			}
			const states = new Map()
			const images = new Map(
				native ? roots.map((root) => [root, document.createElement('img')]) : [],
			)
			const assign = (value) => {
				for (const root of roots) {
					if (!native) {
						Reflect.set(root, 'src', value)
						continue
					}
					const shown = images.get(root)
					shown.remove()
					shown.removeAttribute('src')
					if (!value) {
						states.set(root, 'idle')
						continue
					}
					states.set(root, 'loading')
					const preload = document.createElement('img')
					const finish = () => {
						preload.removeEventListener('load', finish)
						preload.removeEventListener('error', finish)
						const loaded = preload.naturalWidth > 0
						if (loaded) {
							shown.src = value
							root.append(shown)
						}
						states.set(root, loaded ? 'loaded' : 'error')
					}
					preload.addEventListener('load', finish)
					preload.addEventListener('error', finish)
					preload.src = value
					if (preload.complete) finish()
				}
			}
			const status = (root) => (native ? states.get(root) : root.dataset.status)
			assign(source)
			await until(() => roots.every((root) => status(root) === 'loaded'))
			const displayed = () => roots.map((root) => root.querySelector('img'))
			if (variant.endsWith('-wait'))
				await until(() =>
					displayed().every((image) => image?.complete && image.naturalWidth > 0),
				)
			const loadedImages = displayed().filter(
				(image) => image?.complete && image.naturalWidth > 0,
			).length
			assign('data:image/png;base64,broken')
			await until(() => roots.every((root) => status(root) === 'error'))
			assign('')
			await frame()
			await frame()
			if (native) for (const root of roots) root.remove()
			else await bench.unmount()
			await frame()
			await frame()
			return { loadedImages, copies: n }
		},
		{ variant, n: 50 },
	)
}

try {
	for (const variant of [
		'exact-scenario',
		'native-svg',
		'native-png',
		'webc-svg',
		'webc-png',
		'native-svg-wait',
		'webc-svg-wait',
	]) {
		const { browser, page, errors, measure, settled } = await open(base, 'webc')
		const data = {
			variant,
			started: new Date().toISOString(),
			browser: browser.version(),
			points: [],
			observations: [],
			errors,
		}
		result.cases.push(data)
		write()
		try {
			for (let cycle = 0; cycle < 22; cycle++) {
				data.observations.push(await churn(page, variant))
				data.points.push(await measure())
				if (cycle === 1) {
					data.before = await settled(6000)
					if (variant === 'exact-scenario' || variant === 'native-svg')
						data.beforeHeap = await snapshot(page, variant + '-before')
				}
			}
			data.end = await settled(6000)
			if (variant === 'exact-scenario' || variant === 'native-svg')
				data.endHeap = await snapshot(page, variant + '-end')
			data.growth = Object.fromEntries(
				counters.map((key) => [key, data.end[key] - data.before[key]]),
			)
			data.heapBytesPerCycle = slope(data.points.slice(2).map((point) => point.heap))
		} catch (error) {
			data.failure = String(error.stack ?? error)
		} finally {
			await browser.close()
			data.finished = new Date().toISOString()
			write()
		}
		console.log(
			variant,
			JSON.stringify({ growth: data.growth, errors: errors.length, failure: data.failure }),
		)
	}
} finally {
	server.close()
	result.finished = new Date().toISOString()
	write()
}
if (result.cases.some((entry) => entry.failure || entry.errors.length)) process.exitCode = 1
