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

describe('screen-reader activation and live announcements', () => {
	it.each([
		['Select — выбор одного значения', 'Выбор варианта'],
		['Select — поиск и несколько значений', 'Несколько вариантов'],
	])('focuses %s when activation has no pointerdown or keydown', async (title, name) => {
		render(ManualAudit)
		await userEvent.click(page.getByRole('button', { name: new RegExp(title) }))
		await userEvent.click(page.getByRole('button', { name: 'К началу примера', exact: true }))
		const input = page.getByRole('combobox', { name, exact: true }).element()
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		// AT activation is delivered as a click without the browser's pointer focus action.
		input.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))
		await expect.poll(() => document.activeElement).toBe(input)
		await userEvent.keyboard('{ArrowDown}')
		await expect
			.element(page.getByRole('option', { name: 'Первый', exact: true }))
			.toBeVisible()
		await userEvent.keyboard('{Escape}')
		await expect
			.poll(() => document.querySelector('.so-select__panel')?.getClientRects().length ?? 0)
			.toBe(0)
	})

	it('keeps every typed character when editable Select opens and highlights options', async () => {
		render(ManualAudit)
		await userEvent.click(page.getByRole('button', { name: /Select — поиск/ }))
		await userEvent.click(page.getByRole('button', { name: 'К началу примера', exact: true }))
		await userEvent.keyboard('{Tab}')
		const input = page.getByRole('combobox', { name: 'Несколько вариантов', exact: true })
		await expect.poll(() => document.activeElement).toBe(input.element())
		await userEvent.keyboard('Втор')
		await expect.element(input).toHaveValue('Втор')
		await expect.element(input).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{Escape}')
		await expect.element(input).toHaveAttribute('aria-expanded', 'false')
	})
	it('enters the first menu item and submenu item on click-only activation', async () => {
		render(ManualAudit)
		await userEvent.click(page.getByRole('button', { name: /Menu — меню/ }))
		const trigger = page.getByRole('button', { name: 'Действия', exact: true }).element()
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))
		await expect
			.poll(() => document.activeElement?.getAttribute('role'))
			.toBe('menuitemcheckbox')
		const submenu = page.getByRole('menuitem', { name: 'Поделиться', exact: true }).element()
		submenu.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }))
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Ссылка')
		await userEvent.keyboard('{ArrowLeft}')
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Поделиться')
	})

	it('adds polite content to the existing live region instead of inserting a new live region', async () => {
		render(ManualAudit)
		await userEvent.click(page.getByRole('button', { name: /Toasts — уведомления/ }))
		const region = document.querySelector('.so-toasts')
		expect(region?.getAttribute('aria-live')).toBe('polite')
		await userEvent.click(page.getByRole('button', { name: 'обычное', exact: true }))
		const toast = document.querySelector('.so-toasts-item')
		expect(toast?.getAttribute('role')).toBe('listitem')
		expect(toast?.closest('[aria-live]')).toBe(region)
		expect(region?.querySelector('[role="status"]')).toBeNull()
		await userEvent.click(page.getByRole('button', { name: 'error', exact: true }))
		await expect
			.poll(() => document.querySelector('.so-toasts [role="alert"]')?.textContent)
			.toContain('Нет сети')
	})
})
