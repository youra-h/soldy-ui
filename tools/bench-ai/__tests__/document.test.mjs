import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { chromium } from 'playwright'
import { renderDocument } from '../document.mjs'

test('formatted and compact templates receive the same non-null client props', () => {
	const props = { component: 'select', baseline: true, locale: 'ar', dir: 'rtl', count: 10000 }
	for (const input of [
		'<script id="input" type="application/json">null</script>',
		'<script id="input" type="application/json">\n\t\tnull\n\t</script>',
		"<script type='application/json' id='input'> null </script>",
	]) {
		const result = renderDocument('<div><!--ssr--></div>' + input, '<p>SSR</p>', props)
		const payload = result.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
		assert.deepEqual(JSON.parse(payload), props)
		assert(result.includes('<div><p>SSR</p></div>'))
	}
})

test('SSR dollar sequences remain exact and JSON cannot close its script', () => {
	const html = "<p>$& $` $'</p>"
	const props = { locale: '</script><script>example</script>', component: '$&' }
	const result = renderDocument(
		'<!--ssr--><script id="input" type="application/json">null</script>',
		html,
		props,
	)
	assert(result.startsWith(html))
	assert.equal((result.match(/<script/g) ?? []).length, 1)
	const payload = result.match(/<script id="input"[^>]*>([\s\S]*?)<\/script>/)[1]
	assert.deepEqual(JSON.parse(payload), props)
})

test('missing, duplicate or incorrectly typed client inputs fail explicitly', () => {
	const input = '<script id="input" type="application/json">null</script>'
	for (const body of [
		'',
		input + input,
		'<script id="input" type="text/javascript">null</script>',
	])
		assert.throws(() => renderDocument('<!--ssr-->' + body, '', {}), /input/i)
})

test('SSR marker is required exactly once and unrelated script content is preserved', () => {
	const input = '<script id="input" type="application/json">null</script>'
	for (const marker of ['', '<!--ssr--><!--ssr-->'])
		assert.throws(() => renderDocument(marker + input, '', {}), /SSR placeholder/)
	const other = '<script id="other" type="application/json">{"unchanged":true}</script>'
	assert(renderDocument('<!--ssr-->' + other + input, '', {}).includes(other))
})

test('real Vue SSR Teleports hydrate without consuming the app for body and ID targets', async () => {
	const runtime = fs.readFileSync(
		new URL('../../../node_modules/vue/dist/vue.runtime.esm-browser.prod.js', import.meta.url),
	)
	const module = 'data:text/javascript;base64,' + runtime.toString('base64')
	const fixture = ({ h, Teleport }, target) => ({
		render: () =>
			h('main', [
				h('h1', 'SSR fixture'),
				h(Teleport, { to: target }, [h('aside', { id: 'ported' }, 'Portaled content')]),
			]),
	})
	const browser = await chromium.launch()
	try {
		for (const target of ['body', '#overlay']) {
			const context = {}
			const html = await renderToString(Vue.createSSRApp(fixture(Vue, target)), context)
			const template =
				'<!doctype html><html><body>\n<div id="app"><!--ssr--></div><div id="overlay"></div><script id="input" type="application/json">null</script></body></html>'
			const document = renderDocument(template, html, { target }, context.teleports)
			const page = await browser.newPage()
			const errors = []
			page.on('console', (message) => {
				if (['error', 'warning'].includes(message.type())) errors.push(message.text())
			})
			page.on('pageerror', (error) => errors.push(error.message))
			await page.setContent(document)
			await page.evaluate(() => {
				window.initialMain = document.querySelector('#app main')
			})
			await page.addScriptTag({
				type: 'module',
				content: `import * as Vue from '${module}'; const fixture = ${fixture.toString()}; Vue.createSSRApp(fixture(Vue, ${JSON.stringify(target)})).mount('#app'); document.documentElement.dataset.hydrated = 'true'`,
			})
			await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true')
			assert.equal(await page.getByRole('heading', { name: 'SSR fixture' }).isVisible(), true)
			assert.equal(await page.getByText('Portaled content').isVisible(), true)
			assert.equal(
				await page.evaluate(
					() => window.initialMain === document.querySelector('#app main'),
				),
				true,
			)
			assert.deepEqual(errors, [])
			await page.close()
		}
	} finally {
		await browser.close()
	}
})

test('unsupported or missing Teleport targets are explicit instead of silently discarded', () => {
	const template =
		'<html><body><!-- <div id="missing"></div> --><div><!--ssr--></div><script id="input" type="application/json">null</script></body></html>'
	assert.throws(
		() => renderDocument(template, '', {}, { '.external': '<p>Portal</p>' }),
		/Unsupported SSR teleport target/,
	)
	assert.throws(
		() => renderDocument(template, '', {}, { '#missing': '<p>Portal</p>' }),
		/exactly one SSR teleport target/,
	)
})
