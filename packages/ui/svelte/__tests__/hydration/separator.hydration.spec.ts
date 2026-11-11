import { it, expect } from 'vitest'
import SeparatorPage from './SeparatorPage.test.svelte'
import { expectServedNodes, hydrateServed, markupOf, serve } from './serve'

it('hydrates both separator modes while retaining server nodes', () => {
	const container = serve(markupOf('separator'))
	const nodes = [...container.querySelectorAll('*')]
	hydrateServed(container, SeparatorPage, {})

	expectServedNodes([...container.querySelectorAll('*')], nodes)
	expect(container.querySelector('[role="separator"]')?.getAttribute('aria-orientation')).toBe(
		'vertical',
	)
	expect(container.querySelector('[role="none"]')?.hasAttribute('aria-orientation')).toBe(false)
})
