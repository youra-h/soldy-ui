import { it, expect } from 'vitest'
import BadgePage from './BadgePage.test.svelte'
import { expectServedNodes, hydrateServed, markupOf, serve } from './serve'

it('hydrates the server Badge indicator and anchor in place', () => {
	const html = markupOf('badge')
	expect(html).toContain('99+')
	expect(html).toContain('aria-label="120 unread"')
	const container = serve(html)
	const nodes = [...container.querySelectorAll('*')]
	hydrateServed(container, BadgePage, {})
	expectServedNodes([...container.querySelectorAll('*')], nodes)
	expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('120 unread')
	expect(container.querySelector('button')?.textContent).toBe('Inbox')
})
