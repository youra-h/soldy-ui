import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { defineComponent, h } from 'vue'
import { Alert, Button } from '@soxa-ui/vue'
import { TAlert } from '@soxa-ui/core'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import { forcedColors } from './media'
import { contrast } from './colors'
import { render } from './render'
import '@soxa-ui/theme-oren'

let handle: IPreviewHandle | undefined
let container: HTMLElement | undefined

afterEach(async () => {
	handle?.unmount()
	handle = undefined
	container?.remove()
	container = undefined
	document.documentElement.removeAttribute('data-so-theme')
	await forcedColors('none')
})

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

function find(selector: string): HTMLElement {
	const node = container?.querySelector(selector)

	if (!(node instanceof HTMLElement)) throw new Error(selector)

	return node
}

describe.each(FRAMEWORKS)('Alert · $id', ({ id }) => {
	it.each(['ltr', 'rtl'])(
		'keeps narrow content in flow and supports dismissal in %s',
		async (direction) => {
			const host = await loadHost(id)
			const ctrl = new TAlert({ closable: true })
			let blocked = true
			ctrl.events.on('hide:before', (event) => {
				if (blocked) event.preventDefault()
			})

			container = document.createElement('form')
			let submits = 0
			container.addEventListener('submit', (event) => {
				event.preventDefault()
				submits++
			})
			container.style.cssText = 'inline-size:240px;padding:8px'

			const before = document.createElement('button')
			before.textContent = 'Before alert'
			before.type = 'button'
			container.append(before)
			document.body.append(container)
			before.focus()

			const scene = document.createElement('div')
			container.append(scene)
			handle = host.mount(scene, {
				component: 'alert',
				props: { ctrl, direction, closable: true, variant: 'caution' },
			})
			await frame()
			await frame()

			const root = find('.so-alert')
			const close = find('.so-alert__close')
			const closeLabel = close.getAttribute('aria-label')

			if (!closeLabel) throw new Error('Dismissal has no accessible name')

			expect(document.activeElement).toBe(before)
			expect(root.getAttribute('role')).toBe('alert')
			expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
			expect(find('.so-alert__icon').getAttribute('aria-hidden')).toBe('true')
			expect(close.getAttribute('type')).toBe('button')

			await page.getByRole('button', { name: 'Обновить', exact: true }).click()

			expect(ctrl.visible).toBe(true)

			await page.getByRole('button', { name: closeLabel, exact: true }).click()

			expect(ctrl.visible).toBe(true)

			blocked = false
			await page.getByRole('button', { name: closeLabel, exact: true }).click()

			await expect.element(page.getByRole('alert', { includeHidden: true })).not.toBeVisible()

			ctrl.show()
			await frame()

			await expect.element(page.getByRole('alert', { includeHidden: true })).toBeVisible()
			expect(submits).toBe(0)
		},
	)

	it('switches theme views and preserves readable controls in both schemes', async () => {
		const host = await loadHost(id)
		container = document.createElement('div')
		document.body.append(container)
		handle = host.mount(container, {
			component: 'alert',
			props: { variant: 'accent', closable: true },
		})
		await frame()

		const defaultBackground = getComputedStyle(find('.so-alert')).backgroundColor
		handle.update({ variant: 'accent', closable: true, view: 'soft' })
		await frame()

		expect(getComputedStyle(find('.so-alert')).backgroundColor).toBe(defaultBackground)

		for (const scheme of ['oren', 'oren-dark']) {
			document.documentElement.setAttribute('data-so-theme', scheme)

			for (const view of ['outlined', 'soft', 'filled']) {
				const backgrounds = new Set<string>()

				for (const variant of ['normal', 'accent', 'positive', 'caution', 'negative']) {
					handle.update({ variant, view, closable: true })
					await frame()

					const root = find('.so-alert')
					const style = getComputedStyle(root)
					backgrounds.add(style.backgroundColor)

					expect(root.classList.contains('so-alert--view-' + view)).toBe(true)

					if (view === 'filled') {
						expect(getComputedStyle(find('.so-alert__icon')).color).toBe(style.color)
						await expect
							.poll(() => getComputedStyle(find('.so-alert__close')).color)
							.toBe(style.color)
						expect(getComputedStyle(find('.so-alert__action .so-button')).color).toBe(
							style.color,
						)
					} else {
						expect(
							contrast(style.color, [style.backgroundColor]),
						).toBeGreaterThanOrEqual(4.5)
					}

					if (view === 'outlined') {
						expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
					}
				}

				expect(backgrounds.size).toBe(view === 'outlined' ? 1 : 5)
			}
		}

		await forcedColors('active')

		for (const view of ['outlined', 'soft', 'filled']) {
			handle.update({ variant: 'negative', closable: true, view })
			await frame()

			const rootStyle = getComputedStyle(find('.so-alert'))

			expect(rootStyle.borderTopStyle).toBe('solid')
			expect(parseFloat(rootStyle.borderTopWidth)).toBeGreaterThan(0)
			expect(getComputedStyle(find('.so-alert__content')).color).toBe(rootStyle.color)
			expect(getComputedStyle(find('.so-alert__icon')).color).toBe(rootStyle.color)
		}
	})
})

it('uses inherited geometry overrides and no empty optional columns', () => {
	const app = defineComponent({
		render: () =>
			h('div', { style: { width: '240px', '--so-alert-padding': '20px' } }, [
				h(Alert, { role: 'status' }, () => 'LongMessageWithoutBreaks'.repeat(8)),
			]),
	})
	container = render(app)

	const root = find('.so-alert')

	expect(getComputedStyle(root).paddingInlineStart).toBe('20px')
	expect(getComputedStyle(root).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(1)
	expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
	expect(root.getAttribute('role')).toBe('status')
})

it('places multiple actions in a row and wraps them within narrow alerts', () => {
	const app = defineComponent({
		render: () =>
			h(
				Alert,
				{ style: { width: '420px' } },
				{
					title: () => 'Connection interrupted',
					default: () => 'Try again or read the details.',
					action: () => [
						h(Button, { type: 'button' }, () => 'Try again'),
						h(Button, { type: 'button' }, () => 'Read details'),
					],
				},
			),
	})
	container = render(app)

	const root = find('.so-alert')
	const buttons = root.querySelectorAll('.so-alert__action button')

	expect(buttons).toHaveLength(2)
	expect(buttons[0].getBoundingClientRect().top).toBe(buttons[1].getBoundingClientRect().top)

	root.style.width = '140px'

	expect(buttons[1].getBoundingClientRect().top).toBeGreaterThan(
		buttons[0].getBoundingClientRect().top,
	)
	expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
})
