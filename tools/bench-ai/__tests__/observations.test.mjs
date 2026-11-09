import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright'
import { calendarFocusReturned, selectTouch } from '../scenarios.mjs'
import {
	motionSummary,
	observeMotion,
	partitionAxe,
	parseFilters,
	annotateAxe,
} from '../observations.mjs'

test('filters reject typos instead of accidentally running the matrix', () => {
	assert.deepEqual(parseFilters(['--component=table', '--engine=chromium', '--mode=large']), {
		component: 'table',
		engine: 'chromium',
		mode: 'large',
	})
	assert.throws(() => parseFilters(['--mode=larg']))
})

test('browser contract fixtures accept documented focus and touch and reject real breakage', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage({ hasTouch: true })
		await page.setContent(
			'<section aria-label="Candidate"><button aria-haspopup="dialog">Choose date</button><span class="so-date-input__segment" role="spinbutton" tabindex="0">11</span></section>',
		)
		await page.getByRole('spinbutton').focus()
		await calendarFocusReturned(page)
		await page.getByRole('spinbutton').evaluate((n) => n.blur())
		await assert.rejects(calendarFocusReturned(page), /restore focus/)
		await page.setContent(
			'<input role="combobox" aria-label="Choose items" aria-expanded="false"><button class="so-select__arrow">Open</button><div role="listbox" hidden><div role="option" aria-selected="false">Alpha 1</div></div>',
		)
		await page.evaluate(() => {
			const combo = document.querySelector('input'),
				list = document.querySelector('[role=listbox]'),
				option = document.querySelector('[role=option]')
			document.querySelector('button').onclick = () => {
				list.hidden = false
				combo.setAttribute('aria-expanded', 'true')
			}
			option.onclick = () => option.setAttribute('aria-selected', 'true')
		})
		await selectTouch(page)
		await page.evaluate(() => {
			document.querySelector('input').setAttribute('aria-expanded', 'false')
			document.querySelector('[role=option]').setAttribute('aria-selected', 'false')
			document.querySelector('[role=option]').onclick = () => {}
		})
		await assert.rejects(selectTouch(page), /select Alpha 1/)
	} finally {
		await browser.close()
	}
})

test('motion keeps appearance timings, catches geometry, ignores constant keyframes and marks unknown incomplete', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage({ reducedMotion: 'reduce' })
		await page.setContent('<div>Animation fixture</div>')
		const observe = async (frames) => {
			await page.evaluate((frames) => {
				document.getAnimations().forEach((a) => a.cancel())
				document
					.querySelector('div')
					.animate(frames, { duration: 200, iterations: Infinity })
			}, frames)
			return motionSummary(await page.evaluate(observeMotion))
		}
		const opacity = await observe([{ opacity: 0 }, { opacity: 1 }])
		assert.equal(opacity.status, 'passed-observed-states')
		assert.equal(opacity.animations[0].timing.duration, 200)
		assert.equal(
			(await observe([{ transform: 'translateX(0px)' }, { transform: 'translateX(10px)' }]))
				.status,
			'movement-observed',
		)
		assert.equal(
			(
				await observe([
					{ opacity: 0, transform: 'none' },
					{ opacity: 1, transform: 'none' },
				])
			).status,
			'passed-observed-states',
		)
		assert.equal(
			(await observe([{ clipPath: 'inset(0%)' }, { clipPath: 'inset(20%)' }])).status,
			'incomplete',
		)
	} finally {
		await browser.close()
	}
})

test('axe keeps host region best practice separate and retains broken ARIA symmetrically', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		const axe = fs.readFileSync(
			new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url),
			'utf8',
		)
		for (const participant of ['soxa', 'candidate'])
			for (const inside of [true, false]) {
				const content =
					'<div role="listbox" aria-label="Options"><div>Broken option</div></div>'
				await page.setContent(
					`<!doctype html><html lang="en"><head><title>${participant}</title></head><body><main><h1>Fixture</h1>${inside ? content : ''}</main>${inside ? '' : content}</body></html>`,
				)
				await page.addScriptTag({ content: axe })
				const result = partitionAxe(
					await page.evaluate(annotateAxe, await page.evaluate(() => window.axe.run())),
				)
				assert(result.wcag.some((v) => v.id === 'aria-required-children'))
				assert.equal(
					result.documentIntegration.some((v) => v.id === 'region'),
					!inside,
				)
				assert(result.violations.length >= result.wcag.length)
			}
	} finally {
		await browser.close()
	}
})
