import { it, expect, onTestFinished } from 'vitest'
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
	view?: 'outlined',
) {
	render(
		defineComponent({
			render: () => [
				h(Button, { id: 'before', text: 'Before' }),
				h(ToggleGroup, {
					orientation,
					direction,
					view,
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
	await show('vertical', 'ltr', 'outlined')
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

it('preserves an explicit submit type, submitter and form attributes', async () => {
	let submitted: SubmitEvent | undefined
	render(
		defineComponent({
			render: () =>
				h(
					'form',
					{
						onSubmit: (event: SubmitEvent) => {
							event.preventDefault()
							submitted = event
						},
					},
					[
						h(ToggleButton, {
							text: 'Bold',
							type: 'submit',
							name: 'action',
							value: 'bold',
							formmethod: 'post',
						}),
					],
				),
		}),
	)
	await frame()
	const element = document.querySelector('.so-toggle-button')
	if (!(element instanceof HTMLButtonElement)) throw new Error('Toggle button is missing')
	element.focus()
	await userEvent.keyboard('{Enter}')
	expect(submitted?.submitter).toBe(element)
	expect(element.type).toBe('submit')
	expect(element.name).toBe('action')
	expect(element.value).toBe('bold')
	expect(element.formMethod).toBe('post')
})

it('keeps the focused action and its focus ring inside an overflowing group', async () => {
	render(
		defineComponent({
			render: () =>
				h('div', { style: 'width:180px' }, [
					h(ToggleGroup, {
						aria_label: 'Formatting',
						items: Array.from({ length: 6 }, (_, index) => ({
							text: 'Action ' + index,
						})),
					}),
				]),
		}),
	)
	await frame()
	const group = document.querySelector('.so-toggle-group')
	if (!(group instanceof HTMLElement)) throw new Error('Toggle group is missing')

	button(0).focus()
	await userEvent.keyboard('{End}')
	expect(document.activeElement).toBe(button(5))
	expect(button(5).getAttribute('aria-pressed')).toBe('false')
	await expect.poll(() => group.scrollLeft).toBeGreaterThan(0)
	const box = button(5).getBoundingClientRect()
	const viewport = group.getBoundingClientRect()
	const bleed = parseFloat(getComputedStyle(group).paddingInlineEnd)

	expect(box.left).toBeGreaterThanOrEqual(viewport.left + bleed - 1)
	expect(box.right).toBeLessThanOrEqual(viewport.right - bleed + 1)
})

for (const theme of ['oren', 'oren-dark']) {
	for (const orientation of ['horizontal', 'vertical'] as const) {
		for (const direction of ['ltr', 'rtl'] as const) {
			for (const view of [undefined, 'outlined'] as const) {
				it(`joins segments and preserves outlined spacing: ${theme}, ${orientation}, ${direction}, ${view ?? 'default'}`, async () => {
					const previousTheme = document.documentElement.getAttribute('data-so-theme')
					document.documentElement.dataset.soTheme = theme
					onTestFinished(() => {
						if (previousTheme === null)
							document.documentElement.removeAttribute('data-so-theme')
						else document.documentElement.setAttribute('data-so-theme', previousTheme)
					})
					render(
						defineComponent({
							render: () =>
								h(ToggleGroup, {
									view,
									orientation,
									direction,
									aria_label: 'Text alignment',
									items: [
										{ text: 'Left' },
										{ text: 'Center' },
										{ text: 'Right' },
									],
								}),
						}),
					)
					await frame()
					const group = button(0).parentElement
					if (!group) throw new Error('Toggle group is missing')
					const style = getComputedStyle(group)
					const first = button(0).getBoundingClientRect()
					const middle = button(1).getBoundingClientRect()
					const horizontal = orientation === 'horizontal'
					const gap = horizontal
						? Math.max(first.left, middle.left) - Math.min(first.right, middle.right)
						: middle.top - first.bottom

					expect(style.borderTopWidth).toBe('1px')
					expect(gap).toBeCloseTo(view === 'outlined' ? 4 : 0, 1)
					expect(style.paddingTop).toBe(view === 'outlined' ? '2px' : '0px')
					const segment = getComputedStyle(button(1))
					for (const corner of [
						segment.borderTopLeftRadius,
						segment.borderTopRightRadius,
						segment.borderBottomLeftRadius,
						segment.borderBottomRightRadius,
					])
						expect(corner).toBe('0px')
					expect(
						horizontal ? segment.borderInlineStartWidth : segment.borderBlockStartWidth,
					).toBe('1px')

					button(0).focus()
					await userEvent.keyboard(
						horizontal
							? direction === 'rtl'
								? '{ArrowLeft}'
								: '{ArrowRight}'
							: '{ArrowDown}',
					)
					expect(document.activeElement).toBe(button(1))
					const focus = getComputedStyle(button(1))
					expect(parseFloat(focus.outlineWidth)).toBeGreaterThan(0)
					expect(focus.outlineOffset).toBe('-2px')
				})
			}
		}
	}
}

it('keeps default segments quiet and gives a pressed segment a visible fill', async () => {
	await show()
	const idle = getComputedStyle(button(0)).backgroundColor
	expect(idle).toBe('rgba(0, 0, 0, 0)')
	button(0).focus()
	await userEvent.keyboard(' ')
	await expect.poll(() => button(0).getAttribute('aria-pressed')).toBe('true')
	await expect.poll(() => getComputedStyle(button(0)).backgroundColor).not.toBe(idle)
})
