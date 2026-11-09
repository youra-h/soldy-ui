import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chromium } from 'playwright'
import { tabsKeyboard, gridKeyboard, lastTableRecord } from '../scenarios.mjs'

test('real keyboard checker rejects a deliberately broken Tabs fixture', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<div role="tablist"><button role="tab" aria-selected="true">Alpha</button><button role="tab" aria-selected="false">Beta</button><button role="tab" aria-selected="false">Gamma</button></div><div role="tabpanel" aria-label="Alpha">Alpha panel</div>',
		)
		await assert.rejects(tabsKeyboard(page), /End must activate/)
	} finally {
		await browser.close()
	}
})
test('axe detects an intentionally unnamed button', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<!doctype html><html lang="en"><head><title>Negative control</title></head><body><main><h1>Control</h1><button></button></main></body></html>',
		)
		await page.addScriptTag({
			content: fs.readFileSync(
				new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url),
				'utf8',
			),
		})
		const violations = await page.evaluate(async () =>
			(await window.axe.run()).violations.map((v) => v.id),
		)
		assert(violations.includes('button-name'))
	} finally {
		await browser.close()
	}
})
test('grid keyboard checker rejects a role-only grid and accepts active-descendant navigation', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		await page.setContent(
			'<div role="grid" aria-label="Records" tabindex="0" aria-activedescendant="g1"><div role="row"><div role="gridcell" id="g1">Alpha</div></div><div role="row"><div role="gridcell" id="g2">Beta</div></div></div>',
		)
		const grid = page.getByRole('grid', { name: 'Records' })
		await assert.rejects(gridKeyboard(page, grid), /ArrowDown/)
		await grid.evaluate((root) =>
			root.addEventListener('keydown', (event) => {
				if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
					event.preventDefault()
					root.setAttribute(
						'aria-activedescendant',
						event.key === 'ArrowDown' ? 'g2' : 'g1',
					)
				}
			}),
		)
		await gridKeyboard(page, grid)
	} finally {
		await browser.close()
	}
})

test('virtual table boundary follows either public sort direction and retains selection', async () => {
	const browser = await chromium.launch()
	try {
		const page = await browser.newPage()
		for (const [direction, name] of [
			['ascending', 'Record 10000'],
			['descending', 'Record 00001'],
		]) {
			await page.setContent(
				`<table aria-label="Records" aria-rowcount="10001"><thead><tr><th aria-sort="${direction}">Name</th></tr></thead><tbody><tr><td>${name}<input type="checkbox" checked aria-label="Select record"></td></tr></tbody></table>`,
			)
			await lastTableRecord(page)
		}
		await page.getByRole('checkbox').uncheck()
		await assert.rejects(lastTableRecord(page), /Select-all must persist/)
	} finally {
		await browser.close()
	}
})
