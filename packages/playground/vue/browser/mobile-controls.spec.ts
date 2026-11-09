import { afterEach, describe, expect, it } from 'vitest'
import { commands } from 'vitest/browser'
import { h, defineComponent, type Component } from 'vue'
import { Button, CheckBox, Switch, Label, DateInput } from '@soxa-ui/vue'
import { TDateInput } from '@soxa-ui/core'
import { render, cleanup } from './render'
import { mountMobile, find, frame } from './mobile'

afterEach(cleanup)

describe('native mobile touch commands', () => {
	it('uses iframe coordinates, emits touch pointer events and one click per tap', async () => {
		const events: string[] = []
		render(
			defineComponent({
				render: () =>
					h('div', { style: 'padding:80px 40px' }, [
						h(Button, {
							id: 'target',
							text: 'Touch',
							onPointerdown: (e: PointerEvent) =>
								events.push(e.pointerType + ':down'),
							onPointerup: (e: PointerEvent) => events.push(e.pointerType + ':up'),
							onClick: () => events.push('click'),
						}),
					]),
			}),
		)
		await frame()
		await commands.tap('#target')
		expect(events).toEqual(['touch:down', 'touch:up', 'click'])
		await commands.tap('#target', 2)
		expect(events.filter((event) => event === 'click')).toHaveLength(3)
	})
	it.each(['input', 'textarea'])('%s accepts text without keydown after tap', async (id) => {
		const root = await mountMobile(id)
		const field = root.querySelector('input,textarea')
		if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement))
			throw new Error('missing input')
		field.id = 'text-target'
		let keys = 0
		field.addEventListener('keydown', () => keys++)
		await commands.tap('#text-target')
		await commands.insertText('Phone input')
		expect(field.value).toBe('Phone input')
		expect(keys).toBe(0)
	})
	it.each<Component>([CheckBox, Switch])(
		'label toggles a control exactly once; disabled does not change',
		async (Control) => {
			let changes = 0
			render(
				defineComponent({
					render: () =>
						h(Label, { id: 'label', text: 'A long accessible mobile label' }, () =>
							h(Control, { 'onChange:value': () => changes++ }),
						),
				}),
			)
			await frame()
			await frame()
			await commands.tap('#label')
			expect(changes).toBe(1)
			cleanup()
			render(
				defineComponent({
					render: () =>
						h(Control, {
							id: 'disabled',
							disabled: true,
							'onChange:value': () => changes++,
						}),
				}),
			)
			await frame()
			await frame()
			await commands.tap('#disabled')
			expect(changes).toBe(1)
		},
	)
	it('date segment is editable before native focus and accepts text', async () => {
		const ctrl = new TDateInput({ value: '2026-05-12' })
		render(defineComponent({ render: () => h(DateInput, { ctrl }) }))
		await frame()
		await frame()
		await commands.tap('.so-date-input__segment[data-type="day"]')
		const segment = find('.so-date-input__segment[data-type="day"]')
		expect(segment.isContentEditable).toBe(true)
		expect(document.activeElement).toBe(segment)
		await commands.insertText('2')
		expect(ctrl.value).not.toBe('2026-05-12')
	})
})

it.each(['dialog', 'drawer'])('%s opens and its close action stays reachable', async (id) => {
	await mountMobile(id)
	await commands.tap('#mobile-scene .so-button')
	await expect
		.poll(() => document.querySelector('.so-' + id)?.getAttribute('data-open'))
		.toBe('true')
	await commands.tap('.so-' + id + '__close')
	await expect
		.poll(() => document.querySelector('.so-' + id)?.getAttribute('data-open'))
		.toBe('false')
})

it.each(['popover', 'menu'])('%s opens from touch and closes on an outside tap', async (id) => {
	await mountMobile(id)
	await commands.tap('#mobile-scene .so-button')
	await expect
		.poll(() => document.querySelector('.so-' + id)?.getAttribute('data-open'))
		.toBe('true')
	const outside = document.createElement('button')
	outside.id = 'outside'
	outside.style.cssText = 'position:fixed;bottom:20px;right:20px;width:90px;height:44px'
	outside.textContent = 'Outside'
	document.body.append(outside)
	try {
		await commands.tap('#outside')
		await expect
			.poll(() => document.querySelector('.so-' + id)?.getAttribute('data-open'))
			.toBe('false')
	} finally {
		outside.remove()
	}
})

it('readonly text and checkbox keep their values under touch', async () => {
	await mountMobile('input', { value: 'Fixed', readonly: true })
	await commands.tap('.so-input input')
	await commands.insertText('changed')
	expect(document.querySelector('input')?.value).toBe('Fixed')
	cleanup()
	await mountMobile('check-box', { readonly: true })
	await commands.tap('.so-check-box')
	expect(document.querySelector('input')?.checked).toBe(false)
})

it.each([
	['tabs', '.so-tabs-item:nth-child(2)', '.so-tabs-item:nth-child(2)', 'data-selected'],
	[
		'list-box',
		'.so-list-box-item:nth-child(2)',
		'.so-list-box-item:nth-child(2)',
		'data-selected',
	],
	[
		'radio-group',
		'.so-radio-group-item:nth-child(2)',
		'.so-radio-group-item:nth-child(2)',
		'data-selected',
	],
	[
		'accordion',
		'.so-accordion-item:nth-child(2) button',
		'.so-accordion-item:nth-child(2)',
		'data-selected',
	],
])('%s selects or expands content with a tap', async (id, target, state, attribute) => {
	await mountMobile(id)
	await commands.tap(target)
	await expect.poll(() => find(state).getAttribute(attribute)).toBe('true')
})

it('number stepper changes once per tap', async () => {
	await mountMobile('number-input', { value: 4 })
	await commands.tap('.so-number-input__increment')
	expect(document.querySelector('input')?.value).toBe('5')
})

it('rating selects without leaving a hover preview', async () => {
	await mountMobile('rating')
	await commands.tap('.so-rating__star:nth-child(3)')
	expect(document.querySelector('input')?.value).toBe('3')
	expect(find('.so-rating').getAttribute('data-hovered')).not.toBe('true')
})

it('Select opens, selects an option and closes', async () => {
	await mountMobile('select')
	await commands.tap('.so-select__arrow')
	await expect.poll(() => find('.so-select').dataset.open).toBe('true')
	const option = find('[role="option"]')
	const text = option.textContent?.trim()
	await commands.tap('.so-select-item:first-child')
	await expect.poll(() => document.querySelector('input')?.value).toBe(text)
	expect(find('.so-select').getAttribute('data-open')).toBe('false')
})

it('DatePicker opens a calendar whose actions stay in the visual viewport', async () => {
	await mountMobile('date-picker')
	await commands.tap('.so-date-picker__trigger')
	await expect.poll(() => document.querySelector('.so-calendar__next')).not.toBeNull()
	const box = find('.so-calendar__next').getBoundingClientRect()
	expect(box.right).toBeLessThanOrEqual(innerWidth)
	expect(box.left).toBeGreaterThanOrEqual(0)
	await commands.tap('.so-calendar__next')
})

it('Calendar changes its visible month by tap', async () => {
	await mountMobile('calendar')
	const title = find('.so-calendar__title').textContent
	await commands.tap('.so-calendar__next')
	await expect.poll(() => find('.so-calendar__title').textContent).not.toBe(title)
})

it('Pagination changes the current page', async () => {
	await mountMobile('pagination')
	const before = find('.so-pagination').textContent
	await commands.tap('.so-pagination__next')
	await expect.poll(() => find('.so-pagination').textContent).not.toBe(before)
})

it('Tooltip touch does not leave a stuck hover panel', async () => {
	await mountMobile('tooltip')
	await commands.tap('#mobile-scene .so-button')
	await expect
		.poll(() => document.querySelector('.so-tooltip')?.getAttribute('data-open'))
		.not.toBe('true')
})

it('Toasts can be created and closed by touch', async () => {
	await mountMobile('toasts')
	await commands.tap('#mobile-scene .so-button:first-child')
	await expect.poll(() => document.querySelector('.so-toasts-item__close')).not.toBeNull()
	await commands.tap('.so-toasts-item__close')
	await expect.poll(() => document.querySelector('.so-toasts-item')).toBeNull()
})

it.each([
	['button', '.so-button'],
	['input', '.so-input'],
	['textarea', '.so-textarea'],
	['select', '.so-select'],
	['date-picker', '.so-date-picker__trigger'],
	['calendar', '.so-calendar__next'],
	['pagination', '.so-pagination__next'],
	['label', '.so-label'],
	['accordion', '.so-accordion-item__header'],
])('%s has a default touch target at least 24 CSS px', async (id, selector) => {
	await mountMobile(id)
	const box = find(selector).getBoundingClientRect()
	expect(box.width).toBeGreaterThanOrEqual(24)
	expect(box.height).toBeGreaterThanOrEqual(24)
})

it('small NumberInput stepper uses its real extended hit region', async () => {
	await mountMobile('number-input', { size: 'sm' })
	for (const selector of ['.so-number-input__increment', '.so-number-input__decrement']) {
		const node = find(selector)
		const style = getComputedStyle(node, '::before')
		expect(parseFloat(style.width)).toBeGreaterThanOrEqual(24)
		expect(parseFloat(style.height)).toBeGreaterThanOrEqual(24)
	}
})

it('Table content remains reachable in its internal scroll viewport', async () => {
	await mountMobile('table')
	const viewport = find('.so-table__viewport')
	await expect.poll(() => viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth)
	await expect.poll(() => getComputedStyle(viewport).overflowX).toBe('auto')
	viewport.scrollLeft = viewport.scrollWidth
	expect(viewport.scrollLeft).toBeGreaterThan(0)
	const headers = [...document.querySelectorAll('.so-table-column')]
	expect(headers.length).toBeGreaterThan(1)
	const last = headers[headers.length - 1].getBoundingClientRect()
	expect(last.right).toBeLessThanOrEqual(innerWidth)
})

it('double tap selects a date segment and input replaces it', async () => {
	const ctrl = new TDateInput({ value: '2026-05-12' })
	render(defineComponent({ render: () => h(DateInput, { ctrl }) }))
	await frame()
	await frame()
	await commands.tap('.so-date-input__segment[data-type="month"]', 2)
	expect(document.activeElement).toBe(find('.so-date-input__segment[data-type="month"]'))
	await commands.insertText('7')
	await expect.poll(() => ctrl.value).toBe('2026-07-12')
})

it.each(['virtual', 'drag-and-drop'])(
	'%s keeps collection actions reachable by native tap',
	async (id) => {
		await mountMobile(id)
		const node = find('.so-list-box-item:nth-child(2)')
		node.dataset.mobileTarget = ''
		await commands.tap('[data-mobile-target]')
		await expect.poll(() => node.getAttribute('data-selected')).toBe('true')
	},
)

it('Scroller next action works by tap on both mobile engines', async () => {
	await mountMobile('scroller')
	const viewport = find('.so-scroller__viewport')
	await commands.tap('.so-scroller__next')
	await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0)
})

it('Tags close action removes exactly one item by native tap', async () => {
	await mountMobile('tags', { closable: true })
	const count = document.querySelectorAll('.so-tags-item').length
	await commands.tap('.so-tags-item:first-child .so-tags-item__close')
	await expect.poll(() => document.querySelectorAll('.so-tags-item').length).toBe(count - 1)
})

it('Slider track responds to native tap on both mobile engines', async () => {
	await mountMobile('slider', { value: 0 })
	await commands.tap('.so-slider__track')
	await expect.poll(() => document.querySelector('input')?.value).not.toBe('0')
})

it('Table sort action is reachable by native tap', async () => {
	await mountMobile('table')
	const button = find('.so-table-column__sort')
	button.dataset.mobileSort = ''
	const header = button.closest('th')
	const before = header?.getAttribute('aria-sort')
	await commands.tap('[data-mobile-sort]')
	await expect.poll(() => header?.getAttribute('aria-sort')).not.toBe(before)
})
