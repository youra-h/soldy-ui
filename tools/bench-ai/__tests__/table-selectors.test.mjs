import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { lastTableRecord, scenario, tableColumnName } from '../scenarios.mjs'

test('record reachability matches the exact data cell instead of a hidden row ordinal', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<table aria-label="Records" aria-rowcount="10001"><thead><tr><th aria-sort="ascending">Name</th></tr></thead><tbody><tr><td><span>Select Record 00001, record 10000</span><input type="checkbox" aria-label="Select first"></td><th scope="row">Record 00001</th></tr><tr><td><span>Select Record 10000, record 1</span><input type="checkbox" checked aria-label="Select last"></td><th scope="row"><bdi>Record 10000</bdi></th></tr></tbody></table>',
		)
		await lastTableRecord(page)
		await page.getByRole('checkbox', { name: 'Select last' }).uncheck()
		await assert.rejects(lastTableRecord(page), /Select-all must persist/)
	} finally {
		await browser.close()
	}
})

test('RTL table scenarios retain sorting and selection checks with semantic Arabic column names', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		for (const score of ['النتيجة', 'الدرجة', 'النقاط']) {
			await page.setContent(
				`<main lang="ar" dir="rtl"><table aria-label="Records"><thead><tr><th><input type="checkbox" aria-label="Select all"></th><th aria-sort="none"><button>الاسم: ترتيب</button></th><th>${score}</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Select record"></td><th scope="row">Record 00002</th><td>17</td></tr></tbody></table></main>`,
			)
			await page.evaluate(() => {
				const heading = document.querySelector('th[aria-sort]')
				heading.querySelector('button').addEventListener('click', () => {
					const next =
						heading.getAttribute('aria-sort') === 'ascending'
							? 'descending'
							: 'ascending'
					heading.setAttribute('aria-sort', next)
					document.querySelector('tbody th').textContent =
						next === 'ascending' ? 'Record 00001' : 'Record 00002'
				})
				document.querySelector('thead input').addEventListener('change', (event) => {
					document.querySelector('tbody input').checked = event.target.checked
				})
			})
			await scenario('table', page)
		}
	} finally {
		await browser.close()
	}
})

test('column matching preserves English fallback and rejects an absent score field', () => {
	for (const locale of ['en', 'ru', 'ar']) {
		assert.match('Name: sort ascending', tableColumnName('name', locale))
		assert.match('Score', tableColumnName('score', locale))
		assert.doesNotMatch('Selection', tableColumnName('score', locale))
		assert.doesNotMatch('Name', tableColumnName('score', locale))
	}
	assert.match('Баллы', tableColumnName('score', 'ru'))
	assert.match('Название', tableColumnName('name', 'ru'))
})
