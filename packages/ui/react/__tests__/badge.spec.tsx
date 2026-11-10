import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Badge } from '@soxa-ui/react'
import { mount, find, track } from './mount'
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'

describe('Badge', () => {
	it('updates the indicator while preserving its anchor and independent semantics', () => {
		let clicks = 0
		const anchor = <button onClick={() => clicks++}>Inbox</button>
		const app = mount(<Badge value={120} anchor={anchor} />)

		const indicator = () => find(app.root(), '.so-badge__indicator', HTMLElement)
		const button = find(app.root(), 'button', HTMLButtonElement)

		expect(indicator().textContent).toBe('99+')

		app.render(<Badge value={120} dot aria_label="120 unread" anchor={anchor} />)

		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-label')).toBe('120 unread')
		expect(app.root().getAttribute('aria-label')).toBeNull()
		expect(indicator().textContent).toBe('')
		expect(find(app.root(), 'button', HTMLButtonElement)).toBe(button)

		button.click()
		button.focus()

		expect(clicks).toBe(1)
		expect(document.activeElement).toBe(button)

		app.render(<Badge dot anchor={anchor} />)

		expect(indicator().getAttribute('aria-hidden')).toBe('true')

		app.render(<Badge value={0} aria_labelledBy="name" anchor={anchor} />)

		expect(indicator().textContent).toBe('0')
		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-labelledby')).toBe('name')

		app.render(<Badge value="120" anchor={anchor} />)

		expect(indicator().textContent).toBe('120')
		expect(indicator().getAttribute('role')).toBeNull()

		app.render(<Badge value={120} max={9} anchor={anchor} />)

		expect(indicator().textContent).toBe('9+')
	})

	it('renders text and names on the server', () => {
		const html = renderToString(
			<Badge value={100} aria_label="100 unread" anchor={<button>Inbox</button>} />,
		)

		expect(html).toContain('99+')
		expect(html).toContain('role="img"')
		expect(html).toContain('aria-label="100 unread"')
		expect(html).not.toMatch(/aria-live|role="status"/)
	})
})

it('hydrates the server indicator and anchor in place', async () => {
	const tree = <Badge value={120} aria_label="120 unread" anchor={<button>Inbox</button>} />
	const container = document.createElement('div')
	container.innerHTML = renderToString(tree)
	document.body.append(container)
	const nodes = [...container.querySelectorAll('*')]

	await act(async () => {
		track(hydrateRoot(container, tree))
	})

	expect([...container.querySelectorAll('*')].every((node, i) => node === nodes[i])).toBe(true)
	expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('120 unread')
})
