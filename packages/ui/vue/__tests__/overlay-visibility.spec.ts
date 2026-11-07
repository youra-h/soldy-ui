import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { TPopover, TTooltip, TSelect, TDatePicker, TMenu } from '@soldy-ui/core'
import { Popover, Tooltip, Select, DatePicker, Menu } from '@soldy-ui/vue'

const cases = [
	{
		name: 'Popover',
		create: () => {
			const ctrl = new TPopover({ open: true, visible: false })

			return { ctrl, node: h(Popover, { ctrl }) }
		},
		panel: '.so-popover__panel',
	},
	{
		name: 'Tooltip',
		create: () => {
			const ctrl = new TTooltip({ open: true, visible: false })

			return { ctrl, node: h(Tooltip, { ctrl }) }
		},
		panel: '.so-tooltip__panel',
	},
	{
		name: 'Select',
		create: () => {
			const ctrl = new TSelect({ open: true, visible: false })

			return { ctrl, node: h(Select, { ctrl }) }
		},
		panel: '.so-select__panel',
	},
	{
		name: 'DatePicker',
		create: () => {
			const ctrl = new TDatePicker({ open: true, visible: false })

			return { ctrl, node: h(DatePicker, { ctrl }) }
		},
		panel: '.so-date-picker__panel',
	},
	{
		name: 'Menu',
		create: () => {
			const ctrl = new TMenu({ open: true, visible: false })

			return { ctrl, node: h(Menu, { ctrl }) }
		},
		panel: '.so-menu__panel',
	},
]

let wrapper: ReturnType<typeof mount> | undefined

afterEach(() => {
	wrapper?.unmount()
	wrapper = undefined
	document.body.innerHTML = ''
})

describe('overlay owner visibility', () => {
	it.each(cases)(
		'$name hides its detached panel and restores its open state',
		async ({ create, panel }) => {
			const { ctrl, node } = create()
			wrapper = mount({ render: () => node }, { attachTo: document.body })
			await nextTick()

			const element = document.querySelector(panel)
			if (!(element instanceof HTMLElement)) throw new Error('Missing overlay panel')

			expect(element.style.display).toBe('none')
			expect(ctrl.open).toBe(true)

			ctrl.show()
			await nextTick()
			expect(element.style.display).not.toBe('none')

			ctrl.hide()
			await nextTick()
			expect(element.style.display).toBe('none')
			expect(ctrl.open).toBe(true)

			ctrl.show()
			await nextTick()
			expect(element.style.display).not.toBe('none')
			expect(document.querySelector(panel)).toBe(element)

			ctrl.open = false
			await nextTick()
			expect(ctrl.visible).toBe(true)
			expect(element.style.display).toBe('none')
		},
	)
})
