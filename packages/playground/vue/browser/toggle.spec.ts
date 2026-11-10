import { it, expect } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { userEvent } from 'vitest/browser'
import { Button, ToggleButton, ToggleGroup } from '@soxa-ui/vue'
import { render } from './render'
import '@soxa-ui/theme-oren'

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
function button(index: number): HTMLButtonElement {
	const element = document.querySelectorAll('.so-toggle-group-item')[index]
	if (!(element instanceof HTMLButtonElement)) throw new Error('Group button is missing')
	return element
}

async function show(
	orientation: 'horizontal' | 'vertical' = 'horizontal',
	direction: 'ltr' | 'rtl' = 'ltr',
) {
	render(
		defineComponent({
			render: () => [
				h(Button, { id: 'before', text: 'Before' }),
				h(ToggleGroup, {
					orientation,
					direction,
					aria_label: 'Formatting',
					items: [
						{ text: 'Bold' },
						{ text: 'Disabled', disabled: true },
						{ text: 'Italic' },
					],
				}),
				h(Button, { id: 'after', text: 'After' }),
			],
		}),
	)
	await nextTick()
	await frame()
}

it('keeps one Tab stop, skips disabled buttons and activates with Space and Enter', async () => {
	await show()
	button(0).focus()
	await userEvent.keyboard('{ArrowRight}')
	expect(document.activeElement).toBe(button(2))
	expect(button(2).getAttribute('aria-pressed')).toBe('false')
	await userEvent.keyboard(' ')
	await expect.poll(() => button(2).getAttribute('aria-pressed')).toBe('true')
	await userEvent.keyboard('{Enter}')
	await expect.poll(() => button(2).getAttribute('aria-pressed')).toBe('false')
	await userEvent.keyboard('{Home}')
	expect(document.activeElement).toBe(button(0))
	await userEvent.keyboard('{End}')
	expect(document.activeElement).toBe(button(2))
	await userEvent.tab()
	expect(document.activeElement?.id).toBe('after')
})

it('follows RTL without changing selection', async () => {
	await show('horizontal', 'rtl')
	button(0).focus()
	await userEvent.keyboard('{ArrowLeft}')
	expect(document.activeElement).toBe(button(2))
	expect(button(2).getAttribute('aria-pressed')).toBe('false')
})

it('lays out vertically and reads its gap from the document root', async () => {
	await show('vertical')
	const group = button(0).parentElement
	if (!group) throw new Error('Group is missing')
	const previous = document.documentElement.style.getPropertyValue('--so-toggle-group-gap')
	document.documentElement.style.setProperty('--so-toggle-group-gap', '13px')
	try {
		expect(getComputedStyle(group).gap).toBe('13px')
		expect(button(2).getBoundingClientRect().top).toBeGreaterThan(
			button(0).getBoundingClientRect().top,
		)
		button(0).focus()
		await userEvent.keyboard('{ArrowDown}')
		expect(document.activeElement).toBe(button(2))
	} finally {
		if (previous) document.documentElement.style.setProperty('--so-toggle-group-gap', previous)
		else document.documentElement.style.removeProperty('--so-toggle-group-gap')
	}
})

it('shows persistent pressed styling and does not submit its form by default', async () => {
	let submitted = false
	render(
		defineComponent({
			render: () =>
				h(
					'form',
					{
						onSubmit: (event: SubmitEvent) => {
							event.preventDefault()
							submitted = true
						},
					},
					[h(ToggleButton, { text: 'Bold' })],
				),
		}),
	)
	await frame()
	const element = document.querySelector('.so-toggle-button')
	if (!(element instanceof HTMLButtonElement)) throw new Error('Toggle button is missing')
	const background = getComputedStyle(element).backgroundColor
	element.focus()
	await userEvent.keyboard('{Enter}')
	await expect.poll(() => element.getAttribute('aria-pressed')).toBe('true')
	expect(submitted).toBe(false)
	await expect.poll(() => getComputedStyle(element).backgroundColor).not.toBe(background)
})
