import { describe, it, expect } from 'vitest'
import { createRawSnippet, flushSync } from 'svelte'
import { Badge, type BadgeProps } from '@soxa-ui/svelte'
import { mount, find } from './mount'
import { reactiveProps } from './reactive-props.svelte'

describe('Badge', () => {
	it('updates text and semantics without replacing its anchor', () => {
		const anchor = createRawSnippet(() => ({ render: () => '<button>Inbox</button>' }))
		const props = reactiveProps<BadgeProps>({ value: 120, anchor })
		const app = mount(Badge, props)
		const indicator = () => find(app.root(), '.so-badge__indicator', HTMLElement)
		const button = find(app.root(), 'button', HTMLButtonElement)
		let clicks = 0
		button.addEventListener('click', () => clicks++)
		expect(indicator().textContent).toBe('99+')
		props.dot = true
		props.aria_label = '120 unread'
		flushSync()
		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-label')).toBe('120 unread')
		expect(app.root().getAttribute('aria-label')).toBeNull()
		expect(find(app.root(), 'button', HTMLButtonElement)).toBe(button)
		button.click()
		button.focus()
		expect(clicks).toBe(1)
		expect(document.activeElement).toBe(button)
		props.aria_label = undefined
		flushSync()
		expect(indicator().getAttribute('aria-hidden')).toBe('true')
		props.dot = false
		props.value = 0
		props.aria_labelledBy = 'name'
		flushSync()
		expect(indicator().textContent).toBe('0')
		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-labelledby')).toBe('name')
		props.value = '120'
		props.aria_labelledBy = undefined
		flushSync()
		expect(indicator().textContent).toBe('120')
		expect(indicator().getAttribute('role')).toBeNull()
		props.value = 120
		props.max = 9
		flushSync()
		expect(indicator().textContent).toBe('9+')
	})
})
