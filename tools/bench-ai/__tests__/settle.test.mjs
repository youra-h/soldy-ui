import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright'
import { waitForVisualSettling } from '../settle.mjs'

test('axe waits for finite fades, ignores infinite motion, and still reports stable bad contrast', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<!doctype html><html lang="en"><head><title>Settling fixture</title><style>@keyframes reveal{from{opacity:.5}to{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}#fade{animation:reveal .2s linear forwards}#spin{animation:spin 1s linear infinite}</style></head><body style="background:white;color:black"><main><h1>Fixture</h1><p id="fade">Readable text after a finite fade</p><div id="spin" aria-hidden="true"></div></main></body></html>',
		)
		const settled = await waitForVisualSettling(page, 2000)
		assert.equal(
			await page.locator('#fade').evaluate((node) => getComputedStyle(node).opacity),
			'1',
		)
		assert.equal(settled.ignoredInfiniteAnimations, 1)
		await page.addScriptTag({
			content: fs.readFileSync(
				new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url),
				'utf8',
			),
		})
		assert(
			!(
				await page.evaluate(async () =>
					(await window.axe.run()).violations.map((v) => v.id),
				)
			).includes('color-contrast'),
		)
		await page
			.locator('main')
			.evaluate((node) =>
				node.insertAdjacentHTML(
					'beforeend',
					'<p style="color:#aaa;background:white">Persistent bad contrast</p>',
				),
			)
		await waitForVisualSettling(page, 2000)
		assert(
			(
				await page.evaluate(async () =>
					(await window.axe.run()).violations.map((v) => v.id),
				)
			).includes('color-contrast'),
		)
	} finally {
		await browser.close()
	}
})
