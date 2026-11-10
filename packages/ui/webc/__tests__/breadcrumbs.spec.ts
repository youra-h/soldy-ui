import { createEngineBreadcrumbs } from '@soxa-ui/core'
import { afterEach, describe, it, expect } from 'vitest'
import { TBreadcrumbsElement, TBreadcrumbsItemElement } from '@soxa-ui/webc'

afterEach(() => {
	document.body.innerHTML = ''
})
const nextFrame = () => new Promise(requestAnimationFrame)
const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current', _: { active: true } },
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

		expect(root.querySelectorAll('ol > li')).toHaveLength(5)
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
	it('assembles declarative native li items under their own engine and releases them on removal', async () => {
		const engine = createEngineBreadcrumbs()
		const root = document.createElement('nav', { is: 'so-breadcrumbs' })
		if (!(root instanceof TBreadcrumbsElement)) throw new Error('Owner not registered')
		root.engine = engine
		root.maxItems = 3
		for (let index = 0; index < 5; index++) {
			const item = document.createElement('li', { is: 'so-breadcrumbs-item' })
			if (!(item instanceof TBreadcrumbsItemElement)) throw new Error('Item not registered')
			item.text = String(index)
			if (index < 4) item.href = '#' + index
			else item.active = true
			root.append(item)
		}
		document.body.append(root)
		await nextFrame()
		await nextFrame()
		const before = [...engine.extensions.batch.items]
		expect(before).toHaveLength(5)
		expect(engine.extensions.activation.activeItem).toBe(before[4])
		expect(root.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		root.maxItems = 0
		await nextFrame()
		expect(engine.extensions.batch.items).toEqual(before)
		root.remove()
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(engine.options.get('owner')).toBeUndefined()
	})
})
