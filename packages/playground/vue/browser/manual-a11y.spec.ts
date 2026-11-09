import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import ManualAudit from '../src/manual-a11y/ManualAudit.vue'
import { STORAGE_KEY } from '../src/manual-a11y/protocol'
import { render, cleanup } from './render'
import '@soxa-ui/theme-oren'
import '../src/manual-a11y/style.css'

beforeEach(() => {
	localStorage.removeItem(STORAGE_KEY)
	vi.stubGlobal('__MANUAL_A11Y_SOURCE__', { commit: 'browser-test', workingTree: 'clean' })
})
afterEach(() => {
	cleanup()
	localStorage.removeItem(STORAGE_KEY)
	vi.unstubAllGlobals()
})

describe('manual accessibility worksheet', () => {
	it('keeps responses when switching real fixtures, resetting and restoring the page', async () => {
		render(ManualAudit)
		await expect
			.element(page.getByRole('button', { name: 'Открыть окно', exact: true }))
			.toBeVisible()
		await userEvent.fill(
			page.getByRole('textbox', { name: 'Что произнёс диктор — шаг 1', exact: true }),
			'Наблюдение проверяющего',
		)
		await userEvent.selectOptions(
			page.getByRole('combobox', { name: 'Результат шага 1', exact: true }),
			'unclear',
		)
		for (const name of [
			'Drawer — выезжающая панель',
			'Select — выбор одного значения',
			'Select — поиск и несколько значений',
			'Menu — меню и подменю',
			'DatePicker — дата и календарь',
			'Table — таблица, сортировка, выбор',
			'Tabs — вкладки и панели',
			'Toasts — уведомления',
		]) {
			await userEvent.click(page.getByRole('button', { name: new RegExp(name) }))
			await expect
				.poll(() => document.querySelector('.fixture-mount [class*="so-"]'))
				.toBeTruthy()
			expect(document.querySelector('[role="alert"]')).toBeNull()
		}
		await userEvent.click(page.getByRole('button', { name: /Dialog — модальное окно/ }))
		await expect
			.element(
				page.getByRole('textbox', { name: 'Что произнёс диктор — шаг 1', exact: true }),
			)
			.toHaveValue('Наблюдение проверяющего')
		await userEvent.click(
			page.getByRole('button', { name: 'Начать пример заново', exact: true }),
		)
		cleanup()
		render(ManualAudit)
		await expect
			.element(
				page.getByRole('textbox', { name: 'Что произнёс диктор — шаг 1', exact: true }),
			)
			.toHaveValue('Наблюдение проверяющего')
		await expect
			.element(page.getByRole('combobox', { name: 'Результат шага 1', exact: true }))
			.toHaveValue('unclear')
	})
	it('enters the fixture with Tab and returns to its trigger after Escape', async () => {
		render(ManualAudit)
		await userEvent.click(page.getByRole('button', { name: 'К началу примера', exact: true }))
		await userEvent.keyboard('{Tab}')
		expect(document.activeElement?.textContent?.trim()).toBe('Открыть окно')
		await userEvent.keyboard('{Enter}')
		await expect.poll(() => document.activeElement?.closest('[role="dialog"]')).toBeTruthy()
		for (let index = 0; index < 6; index++) {
			await userEvent.keyboard('{Tab}')
			expect(document.activeElement?.closest('[role="dialog"]')).toBeTruthy()
		}
		await userEvent.keyboard('{Escape}')
		await expect
			.poll(() => document.querySelector('[role="dialog"]')?.getClientRects().length ?? 0)
			.toBe(0)
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Открыть окно')
	})
})
