import { it, expect } from 'vitest'
import AlertPage from './AlertPage.test.svelte'
import { expectServedNodes, hydrateServed, markupOf, serve } from './serve'

it('hydrates Alert and its dismissal control without replacing server nodes', () => {
	const container = serve(markupOf('alert'))
	const nodes = [...container.querySelectorAll('*')]

	hydrateServed(container, AlertPage, {})

	expectServedNodes([...container.querySelectorAll('*')], nodes)
	expect(container.querySelector('.so-alert')?.getAttribute('role')).toBe('status')
	expect(container.querySelector('.so-alert__close')?.getAttribute('aria-label')).toBe('Close')
})
