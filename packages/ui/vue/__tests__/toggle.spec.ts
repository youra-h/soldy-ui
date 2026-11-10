import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { ToggleButton, ToggleGroup } from '../src'

const mounted = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const wrappers: Array<{ unmount(): void }> = []
afterEach(() => {
	wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

it('ToggleButton keeps its name, toggles on click and honors preventDefault', async () => {
	const wrapper = mount(ToggleButton, { props: { text: 'Bold' } })
	wrappers.push(wrapper)
	await mounted()
	await wrapper.trigger('click')
	await nextTick()
	expect(wrapper.attributes('aria-pressed')).toBe('true')
	expect(wrapper.attributes('type')).toBe('button')
	expect(wrapper.emitted('update:pressed')).toEqual([[true]])
	expect(wrapper.text()).toBe('Bold')

	const canceled = mount(ToggleButton, {
		attrs: { onClick: (event: MouseEvent) => event.preventDefault() },
	})
	wrappers.push(canceled)
	await mounted()
	await canceled.trigger('click')
	await nextTick()
	expect(canceled.attributes('aria-pressed')).toBe('false')
})

describe('ToggleGroup', () => {
	it('uses single/multiple selection and arrows only move focus', async () => {
		const wrapper = mount(ToggleGroup, {
			attachTo: document.body,
			props: {
				items: [{ text: 'Bold' }, { text: 'Disabled', disabled: true }, { text: 'Italic' }],
			},
		})
		wrappers.push(wrapper)
		await mounted()
		const buttons = wrapper.findAll('button')
		expect(buttons).toHaveLength(3)
		expect(buttons.map((button) => button.attributes('tabindex'))).toEqual(['0', '-1', '-1'])

		await buttons[0].trigger('click')
		await nextTick()
		expect(buttons[0].attributes('aria-pressed')).toBe('true')
		buttons[0].element.focus()
		await buttons[0].trigger('keydown', { key: 'ArrowRight' })
		await nextTick()
		expect(document.activeElement).toBe(buttons[2].element)
		expect(buttons[2].attributes('aria-pressed')).toBe('false')

		await buttons[2].trigger('click')
		await nextTick()
		expect(buttons[0].attributes('aria-pressed')).toBe('false')
		expect(buttons[2].attributes('aria-pressed')).toBe('true')

		await wrapper.setProps({ mode: 'multiple' })
		await buttons[0].trigger('click')
		await nextTick()
		expect(buttons[0].attributes('aria-pressed')).toBe('true')
		expect(buttons[2].attributes('aria-pressed')).toBe('true')
	})

	it('registers declarative items at mount and receives selected props', async () => {
		const wrapper = mount(ToggleGroup, {
			slots: {
				default: () => [
					h(ToggleGroup.Item, { text: 'List', selected: true }),
					h(ToggleGroup.Item, { text: 'Grid' }),
				],
			},
		})
		wrappers.push(wrapper)
		await nextTick()
		expect(
			wrapper.findAll('button').map((button) => button.attributes('aria-pressed')),
		).toEqual(['true', 'false'])
	})
})
