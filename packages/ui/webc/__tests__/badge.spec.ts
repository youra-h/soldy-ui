import { afterEach, describe, it, expect } from 'vitest'
import { TBadgeElement } from '@soxa-ui/webc'

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))
afterEach(() => {
	document.body.innerHTML = ''
})
describe('Badge', () => {
	it('updates text and semantics without replacing its anchor', async () => {
		const root = document.createElement('span', { is: 'so-badge' })

		if (!(root instanceof TBadgeElement)) throw new Error('Badge not registered')

		root.value = 120

		const button = document.createElement('button')
		button.slot = 'anchor'
		button.textContent = 'Inbox'

		root.append(button)
		document.body.append(root)
		await flush()

		const indicator = () => root.querySelector('.so-badge__indicator')
		let clicks = 0

		button.addEventListener('click', () => clicks++)

		expect(indicator()?.textContent).toBe('99+')

		root.dot = true
		root.aria_label = '120 unread'
		await flush()

		expect(indicator()?.getAttribute('role')).toBe('img')
		expect(indicator()?.getAttribute('aria-label')).toBe('120 unread')
		expect(root.getAttribute('aria-label')).toBeNull()
		expect(root.querySelector('button')).toBe(button)

		button.click()
		button.focus()

		expect(clicks).toBe(1)
		expect(document.activeElement).toBe(button)

		root.aria_label = undefined
		await flush()

		expect(indicator()?.getAttribute('aria-hidden')).toBe('true')

		root.dot = false
		root.value = 0
		root.aria_labelledBy = 'name'
		await flush()

		expect(indicator()?.textContent).toBe('0')
		expect(indicator()?.getAttribute('role')).toBe('img')

		root.value = '120'
		root.aria_labelledBy = undefined
		await flush()

		expect(indicator()?.textContent).toBe('120')
		expect(indicator()?.getAttribute('role')).toBeNull()

		root.value = 120
		root.max = 9
		await flush()

		expect(indicator()?.textContent).toBe('9+')
	})
})
