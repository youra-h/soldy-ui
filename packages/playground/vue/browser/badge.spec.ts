import { BADGE_VIEWS, COMPONENT_VARIANTS, COMPONENT_SIZES } from '@soxa-ui/playground-shared'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import '@soxa-ui/theme-oren'
import { defineComponent, h } from 'vue'
import { Badge, Button } from '@soxa-ui/vue'
import { render } from './render'

let handle: IPreviewHandle | undefined
let container: HTMLElement | undefined
afterEach(() => {
	handle?.unmount()
	handle = undefined

	container?.remove()
	container = undefined

	document.documentElement.removeAttribute('data-so-theme')
})

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

function find(selector: string): HTMLElement {
	const node = container?.querySelector(selector)

	if (!(node instanceof HTMLElement)) throw new Error(selector)

	return node
}

async function show(framework: string, props: Record<string, unknown>, anchor = true) {
	const host = await loadHost(framework)

	container = document.createElement('div')
	container.style.cssText = 'padding:40px;display:inline-block'
	document.body.append(container)
	handle = host.mount(container, {
		component: 'badge',
		fixture: anchor ? 'badge-anchor' : undefined,
		props,
	})

	await frame()
	await frame()
}
describe.each(FRAMEWORKS)('Badge · $id', ({ id }) => {
	it.each(['ltr', 'rtl'])(
		'places the overlay at logical end in %s and preserves the accessible button',
		async (direction) => {
			await show(id, { value: 120, direction, aria_label: '120 unread' })

			const button = page.getByRole('button', { name: 'Inbox', exact: true })

			await expect.element(button).toBeVisible()
			await expect
				.element(page.getByRole('img', { name: '120 unread', exact: true }))
				.toBeVisible()

			const anchor = find('.so-badge__anchor button')
			const rect = anchor.getBoundingClientRect(),
				indicator = find('.so-badge__indicator').getBoundingClientRect()

			expect(Math.abs(indicator.y + indicator.height / 2 - rect.y)).toBeLessThan(1)
			expect(
				Math.abs(
					indicator.x +
						indicator.width / 2 -
						(direction === 'ltr' ? rect.right : rect.left),
				),
			).toBeLessThan(1)

			let clicks = 0
			anchor.addEventListener('click', () => clicks++)
			await button.click()

			expect(clicks).toBe(1)

			const before = document.createElement('button')
			before.textContent = 'Before badge'
			container?.prepend(before)
			before.focus()
			await userEvent.keyboard('{Tab}')

			await expect.element(button).toHaveFocus()

			const name = document.createElement('span')
			name.id = 'badge-status-name'
			name.textContent = 'Online'
			container?.append(name)
			handle?.update({ dot: true, direction, aria_labelledBy: name.id })
			await frame()
			await frame()

			expect(find('.so-badge__anchor button')).toBe(anchor)

			await expect
				.element(page.getByRole('img', { name: 'Online', exact: true }))
				.toBeVisible()
			await expect.element(button).toBeVisible()

			handle?.update({ dot: true, direction })
			await frame()
			await frame()

			expect(find('.so-badge__indicator').getAttribute('aria-hidden')).toBe('true')

			await button.click()

			expect(clicks).toBe(2)
		},
	)
	it('keeps inline labels in flow, grows long text and changes dot size with the size scale', async () => {
		await show(id, { value: 'A very long badge label' }, false)

		const indicator = find('.so-badge__indicator')

		expect(getComputedStyle(indicator).position).toBe('static')
		expect(indicator.scrollWidth).toBeLessThanOrEqual(indicator.clientWidth)
		expect(find('.so-badge__anchor').matches(':empty')).toBe(true)

		handle?.update({ dot: true, size: 'sm' })
		await frame()

		const small = indicator.getBoundingClientRect()

		expect(small.width).toBeCloseTo(small.height, 1)

		handle?.update({ dot: true, size: '2xl', view: 'outlined', variant: 'positive' })
		await frame()

		expect(indicator.getBoundingClientRect().width).toBeGreaterThan(small.width)
		expect(getComputedStyle(indicator).borderTopStyle).toBe('solid')

		document.documentElement.setAttribute('data-so-theme', 'oren-dark')
		await frame()

		expect(getComputedStyle(indicator).color).not.toBe('rgba(0, 0, 0, 0)')
	})
})

it('shows every size, view and semantic color in both schemes', async () => {
	await page.viewport(1100, 800)

	const samples = render(
		defineComponent({
			render: () =>
				h(
					'section',
					{
						style: 'width:900px;padding:40px;background:var(--so-component-surface);color:var(--so-component-text);display:grid;gap:32px',
					},
					[
						h('h2', 'Badge'),
						...BADGE_VIEWS.map((view) =>
							h('div', { style: 'display:flex;gap:24px;align-items:center' }, [
								h('span', view),
								...COMPONENT_VARIANTS.map((variant) =>
									h(Badge, { value: 'New', view, variant }),
								),
							]),
						),
						h(
							'div',
							{ style: 'display:flex;gap:24px;align-items:center' },
							COMPONENT_SIZES.map((size) =>
								h(Badge, { value: 120, size, variant: 'accent' }),
							),
						),
						h('div', { style: 'display:flex;gap:48px;align-items:center' }, [
							h(
								Badge,
								{ value: 3, aria_label: '3 unread', variant: 'negative' },
								{ anchor: () => h(Button, null, () => 'Inbox') },
							),
							h(
								Badge,
								{ dot: true, aria_label: 'Online', variant: 'positive' },
								{ anchor: () => h(Button, null, () => 'Profile') },
							),
							h(Badge, { value: 'A longer label that stays fully visible' }),
						]),
					],
				),
		}),
	)

	document.documentElement.setAttribute('data-so-theme', 'oren')
	await frame()

	const indicator = samples.querySelector('.so-badge__indicator')

	if (!(indicator instanceof HTMLElement)) throw new Error('Missing indicator sample')

	const light = getComputedStyle(indicator).backgroundColor
	await page.screenshot({ element: samples, path: '../.vitest/badge-light.png' })

	document.documentElement.setAttribute('data-so-theme', 'oren-dark')
	await frame()

	const dark = getComputedStyle(indicator).backgroundColor

	expect(dark).not.toBe(light)

	await page.screenshot({ element: samples, path: '../.vitest/badge-dark.png' })
})
