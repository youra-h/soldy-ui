import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { calendarTrigger, calendarDayName } from '../scenarios.mjs'

test('calendar opener stays in the common candidate region after a popup is portaled', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<section aria-label="Candidate"><button aria-haspopup="dialog">Choose date</button></section>',
		)
		const trigger = calendarTrigger(page)
		await trigger.click()
		await page.evaluate(() =>
			document.body.insertAdjacentHTML(
				'afterbegin',
				'<div role="dialog"><button aria-haspopup="dialog">Choose month</button><div role="grid"></div></div>',
			),
		)
		assert.equal(await trigger.innerText(), 'Choose date')
		await trigger.click()
		assert.equal(await trigger.evaluate((node) => node === document.activeElement), true)
	} finally {
		await browser.close()
	}
})

test('day name matching accepts Latin and Arabic decimal representations without adjacent digits', () => {
	for (const language of ['en', 'ar', 'ar-EG']) {
		const pattern = calendarDayName(language, 15)
		for (const label of ['Sunday, November 15, 2026', 'الأحد، ١٥ نوفمبر ٢٠٢٦', '۱۵'])
			assert.match(label, pattern)
		for (const label of ['150', '215', '١٥٠', '٢١٥', '۱۵۰', '۲۱۵'])
			assert.doesNotMatch(label, pattern)
	}
})
