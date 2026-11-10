import { describe, it, expect } from 'vitest'
import { flushSync } from 'svelte'
import { Breadcrumbs, type BreadcrumbsProps } from '@soxa-ui/svelte'
import { mount, find, nextFrame } from './mount'
import { reactiveProps } from './reactive-props.svelte'

const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current' },
]

describe('Breadcrumbs', () => {
	it('keeps three list positions and renders hidden native links', async () => {
		const props = reactiveProps<BreadcrumbsProps>({ items, maxItems: 3 })
		const app = mount(Breadcrumbs, props)

		await nextFrame()

		expect(app.root().querySelectorAll('ol > li')).toHaveLength(3)
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)

		find(app.root(), 'button', HTMLButtonElement).click()
		flushSync()
		await nextFrame()
		const row = find(document, 'a[role="menuitem"][href="#catalog"]', HTMLAnchorElement)

		expect(row.target).toBe('_blank')
		expect(row.rel).toBe('external')
		expect(row.querySelector('a,button')).toBeNull()

		props.maxItems = 0
		flushSync()
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelector('button')).toBeNull()
	})
})
