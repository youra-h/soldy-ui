import { it, expect } from 'vitest'
import { act } from 'react'
import { ToggleButton, ToggleGroup } from '../src'
import { mount, nextFrame } from './mount'

it('renders toggle state and honors delegated click cancellation', async () => {
	const mounted = mount(<ToggleButton text="Bold" />)
	await nextFrame()
	await act(async () => {
		mounted.root().click()
		await Promise.resolve()
	})
	expect(mounted.root().getAttribute('aria-pressed')).toBe('true')
	expect(mounted.root().getAttribute('type')).toBe('button')

	const canceled = mount(
		<ToggleButton text="Italic" onClick={(event) => event.preventDefault()} />,
	)
	await nextFrame()
	await act(async () => {
		canceled.root().click()
		await Promise.resolve()
	})
	expect(canceled.root().getAttribute('aria-pressed')).toBe('false')
})

it('renders data items as pressed buttons and selects multiple through the engine', async () => {
	const mounted = mount(
		<ToggleGroup mode="multiple" items={[{ text: 'Bold' }, { text: 'Italic' }]} />,
	)
	await nextFrame()
	const buttons = [...mounted.container.querySelectorAll('button')]
	expect(buttons).toHaveLength(2)
	await act(async () => {
		buttons.forEach((button) => button.click())
		await Promise.resolve()
	})
	expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'true'])
})
