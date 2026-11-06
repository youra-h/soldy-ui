import { describe, expect, it, vi } from 'vitest'
import { TComponentView, TInput, TProgress } from '@soldy-ui/core'

describe('property change payloads', () => {
	it('reports both sides of primitive changes and suppresses equal writes', () => {
		const input = new TInput({ disabled: false, name: 'before' })
		const disabled = vi.fn()
		const name = vi.fn()
		input.events.on('change:disabled', disabled)
		input.events.on('change:name', name)

		input.disabled = true
		input.disabled = true
		input.name = 'after'

		expect(disabled).toHaveBeenCalledExactlyOnceWith({ newValue: true, oldValue: false })
		expect(name).toHaveBeenCalledExactlyOnceWith({ newValue: 'after', oldValue: 'before' })
	})

	it('uses the same envelope for progress and value controls', () => {
		const progress = new TProgress({ value: 2 })
		const input = new TInput({ value: 'before' })
		const progressChange = vi.fn()
		const inputChange = vi.fn()
		progress.events.on('change:value', progressChange)
		input.events.on('change:value', inputChange)

		progress.value = 5
		input.value = 'after'

		expect(progressChange).toHaveBeenCalledExactlyOnceWith({ newValue: 5, oldValue: 2 })
		expect(inputChange).toHaveBeenCalledExactlyOnceWith({
			newValue: 'after',
			oldValue: 'before',
		})
	})

	it('keeps object references without cloning or freezing their contents', () => {
		const before = { nested: { value: 1 } }
		const after = { nested: { value: 2 } }
		const component = new TComponentView({ tag: before })
		component.events.on('change:tag', ({ newValue, oldValue }) => {
			expect(newValue).toBe(after)
			expect(oldValue).toBe(before)
			before.nested.value = 3
		})
		component.tag = after

		expect(component.tag).toBe(after)
		expect(before.nested.value).toBe(3)
	})

	it('does not notify after a canceled write', () => {
		const input = new TInput({ disabled: false })
		const changes = vi.fn()
		input.events.on('change:disabled', changes)
		input.events.on('change:disabled:before', (event) => event.preventDefault())
		input.disabled = true

		expect(input.disabled).toBe(false)
		expect(changes).not.toHaveBeenCalled()
	})

	it('reports the state before each nested change', () => {
		const input = new TInput({ name: 'a' })
		const changes: unknown[] = []
		input.events.on('change:name', (payload) => {
			changes.push(payload)
			if (payload.newValue === 'b') input.name = 'c'
		})
		input.name = 'b'

		expect(changes).toEqual([
			{ newValue: 'b', oldValue: 'a' },
			{ newValue: 'c', oldValue: 'b' },
		])
	})

	it('reports attribute values before the set is changed', () => {
		const component = new TComponentView()
		const changes = vi.fn()
		component.events.on('change:aria', changes)
		component.aria.add('aria-label', 'first')
		component.aria.add('aria-label', 'second')
		component.aria.remove('aria-label')

		expect(changes.mock.calls).toEqual([
			[{ newValue: { 'aria-label': 'first' }, oldValue: {} }],
			[{ newValue: { 'aria-label': 'second' }, oldValue: { 'aria-label': 'first' } }],
			[{ newValue: {}, oldValue: { 'aria-label': 'second' } }],
		])
	})
})
