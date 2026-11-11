import { it, expect } from 'vitest'
import { AvatarPage } from './pages'
import { expectServedNodes, hydrateServed, markupOf, serve } from './serve'
it('hydrates server initials and group nodes without replacing them', () => {
	const container = serve(markupOf('avatar')),
		nodes = [...container.querySelectorAll('*')]
	expect(container.textContent).toBe('AL+3')
	hydrateServed(container, () => <AvatarPage />)
	expectServedNodes([...container.querySelectorAll('*')], nodes)
	expect(container.querySelector('img')).toBeNull()
	expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Ada')
})
