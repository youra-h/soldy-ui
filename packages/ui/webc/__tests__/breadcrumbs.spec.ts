import { afterEach, describe, it, expect } from 'vitest'
import { TBreadcrumbsElement } from '@soxa-ui/webc'
afterEach(() => {
	document.body.innerHTML = ''
})
const nextFrame = () => new Promise(requestAnimationFrame)
const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current' },
]
describe('Breadcrumbs', () => {
	it('uses a native nav and native links in a separate overflow position', async () => {
		const root = document.createElement('nav', { is: 'so-breadcrumbs' })
		if (!(root instanceof TBreadcrumbsElement))
			throw new Error('Breadcrumbs element was not registered')
		root.items = items
		root.maxItems = 3
		document.body.append(root)
		await nextFrame()
		expect(root.querySelectorAll('ol > li')).toHaveLength(3)
		expect(root.getAttribute('aria-label')).toBe('Breadcrumbs')
		expect(root.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		root.querySelector('button')?.click()
		await nextFrame()
		await nextFrame()
		const row = document.querySelector('a[role="menuitem"][href="#catalog"]')
		expect(row?.getAttribute('target')).toBe('_blank')
		expect(row?.getAttribute('rel')).toBe('external')
		expect(row?.querySelector('a,button')).toBeNull()
		root.maxItems = 0
		await nextFrame()
		expect(root.querySelectorAll('ol > li')).toHaveLength(5)
		expect(root.querySelector('button')).toBeNull()
	})
})
