import { afterEach, it, expect } from 'vitest'
import { TToggleButtonElement, TToggleGroupElement } from '../src'

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
afterEach(() => {
	document.body.innerHTML = ''
})

it('renders toggle state on native button roots and collection items', async () => {
	const button = document.createElement('button', { is: 'so-toggle-button' })
	const group = document.createElement('div', { is: 'so-toggle-group' })
	if (!(button instanceof TToggleButtonElement) || !(group instanceof TToggleGroupElement))
		throw new Error('Custom elements are not registered')
	group.items = [{ text: 'Bold' }, { text: 'Italic' }]
	group.mode = 'multiple'
	document.body.append(button, group)
	await frame()
	await frame()
	button.click()
	group.querySelectorAll('button').forEach((item) => item.click())
	await Promise.resolve()
	await Promise.resolve()

	expect(button.getAttribute('aria-pressed')).toBe('true')
	expect(
		[...group.querySelectorAll('button')].map((item) => item.getAttribute('aria-pressed')),
	).toEqual(['true', 'true'])
})
