import { describe, it, expect, vi } from 'vitest'
import { TValueControl } from '@soxa-ui/core'
import type { IValueControlProps } from '@soxa-ui/core'

describe('TValueControl', () => {
	it('принимает value/name через { props } и через plain props', () => {
		type P = IValueControlProps<string>

		const a = new TValueControl<string, P>({ value: 'A', name: 'n1' })
		expect(a.value).toBe('A')
		expect(a.name).toBe('n1')

		const b = new TValueControl<string, P>({ value: 'B', name: 'n2' })
		expect(b.value).toBe('B')
		expect(b.name).toBe('n2')
	})

	it('value setter emits change:value', () => {
		type P = IValueControlProps<string>
		const c = new TValueControl<string, P>({ value: 'x', name: 'n' })
		const changeHandler = vi.fn()
		c.events.on('change:value', changeHandler)

		c.value = 'y'
		expect(changeHandler).toHaveBeenCalledWith({ newValue: 'y', oldValue: 'x' })
		expect(c.value).toBe('y')
	})

	it('name setter эмитит change:name', () => {
		type P = IValueControlProps<string>
		const c = new TValueControl<string, P>({ value: 'x', name: 'a' })
		const handler = vi.fn()
		c.events.on('change:name', ({ newValue }) => handler(newValue))

		c.name = 'b'
		expect(handler).toHaveBeenCalledWith('b')
		expect(c.name).toBe('b')
	})

	it('assign меняет value и name', () => {
		type P = IValueControlProps<string>
		const c = new TValueControl<string, P>({ value: 'x', name: 'a' })
		c.assign({ value: 'y', name: 'b' })
		expect(c.value).toBe('y')
		expect(c.name).toBe('b')
	})

	it('getProps/toJSON отражают value и name', () => {
		type P = IValueControlProps<string>
		const c = new TValueControl<string, P>({ value: 'x', name: 'a' })
		const props = c.getProps()
		expect(props).toMatchObject({ value: 'x', name: 'a' })
		expect(c.toJSON()).toEqual(props)
	})
})
