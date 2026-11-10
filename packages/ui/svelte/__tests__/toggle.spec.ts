import { it, expect } from 'vitest'
import { flushSync } from 'svelte'
import { ToggleButton, ToggleGroup } from '../src'
import { mount, nextFrame } from './mount'

it('renders standalone and collection pressed state', async () => {
	const button = mount(ToggleButton, { text: 'Bold' })
	const group = mount(ToggleGroup, {
		mode: 'multiple',
		items: [{ text: 'Bold' }, { text: 'Italic' }],
	})
	await nextFrame()
	button.root().click()
	group.container.querySelectorAll('button').forEach((node) => node.click())
	await Promise.resolve()
	flushSync()

	expect(button.root().getAttribute('aria-pressed')).toBe('true')
	expect(
		[...group.container.querySelectorAll('button')].map((node) =>
			node.getAttribute('aria-pressed'),
		),
	).toEqual(['true', 'true'])
})
