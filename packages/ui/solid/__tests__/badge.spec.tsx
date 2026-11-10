import { describe, it, expect } from 'vitest'
import { createSignal } from 'solid-js'
import { Badge, type BadgeProps } from '@soxa-ui/solid'
import { mount, find } from './mount'

describe('Badge', () => {
	it('updates text and semantics without replacing its anchor', () => {
		const [props, setProps] = createSignal<BadgeProps>({ value: 120 })
		let clicks = 0
		const app = mount(() => (
			<Badge {...props()} anchor={<button onClick={() => clicks++}>Inbox</button>} />
		))
		const indicator = () => find(app.root(), '.so-badge__indicator', HTMLElement)
		const button = find(app.root(), 'button', HTMLButtonElement)
		expect(indicator().textContent).toBe('99+')
		setProps({ value: 120, dot: true, aria_label: '120 unread' })
		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-label')).toBe('120 unread')
		expect(app.root().getAttribute('aria-label')).toBeNull()
		expect(find(app.root(), 'button', HTMLButtonElement)).toBe(button)
		button.click()
		button.focus()
		expect(clicks).toBe(1)
		expect(document.activeElement).toBe(button)
		setProps({ dot: true })
		expect(indicator().getAttribute('aria-hidden')).toBe('true')
		setProps({ value: 0, aria_labelledBy: 'name' })
		expect(indicator().textContent).toBe('0')
		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-labelledby')).toBe('name')
		setProps({ value: '120' })
		expect(indicator().textContent).toBe('120')
		expect(indicator().getAttribute('role')).toBeNull()
		setProps({ value: 120, max: 9 })
		expect(indicator().textContent).toBe('9+')
	})
})
