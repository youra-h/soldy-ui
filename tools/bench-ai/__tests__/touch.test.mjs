import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium, webkit } from 'playwright'
import { tap } from '../scenarios.mjs'

for (const [name, engine] of [
	['chromium', chromium],
	['webkit', webkit],
]) {
	test(
		`${name} portable tap emits trusted touch events and activates the control`,
		{
			skip:
				name === 'webkit' && process.platform === 'win32'
					? 'Playwright WebKit requires Linux on this Windows host'
					: false,
		},
		async () => {
			const browser = await engine.launch()
			try {
				const page = await browser.newPage({
					hasTouch: true,
					viewport: { width: 360, height: 900 },
				})
				await page.setContent('<button type="button">Touch fixture</button>')
				await page.getByRole('button').evaluate((node) => {
					window.touchTrace = {
						start: 0,
						end: 0,
						clicks: 0,
						trusted: true,
						reportedMaxTouchPoints: navigator.maxTouchPoints,
					}
					for (const [event, key] of [
						['touchstart', 'start'],
						['touchend', 'end'],
						['click', 'clicks'],
					])
						node.addEventListener(event, (event) => {
							window.touchTrace[key]++
							window.touchTrace.trusted &&= event.isTrusted
						})
				})
				await tap(page, page.getByRole('button'))
				const trace = await page.evaluate(() => window.touchTrace)
				assert.equal(trace.start, 1, JSON.stringify(trace))
				assert.equal(trace.end, 1, JSON.stringify(trace))
				assert.equal(trace.clicks, 1, JSON.stringify(trace))
				assert.equal(trace.trusted, true, JSON.stringify(trace))
				const ordinary = await browser.newPage({ hasTouch: false })
				await ordinary.setContent('<button type="button">No touch</button>')
				await assert.rejects(tap(ordinary, ordinary.getByRole('button')), /hasTouch|touch/i)
			} finally {
				await browser.close()
			}
		},
	)
}
