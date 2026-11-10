import { createEngineBreadcrumbs } from '@soxa-ui/core'
import BreadcrumbsItems from './fixtures/BreadcrumbsItems.svelte'
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
	{ text: 'Current', _: { active: true } },
]

describe('Breadcrumbs', () => {
	it('keeps three list positions and renders hidden native links', async () => {
		const props = reactiveProps<BreadcrumbsProps>({ items, maxItems: 3 })
		const app = mount(Breadcrumbs, props)

		await nextFrame()

		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
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
	it('registers declarative Item with standard activation and releases only markup members', () => {
		const engine = createEngineBreadcrumbs()
		const app = mount(BreadcrumbsItems, { engine })
		expect(engine.extensions.batch.items).toHaveLength(5)
		expect(engine.extensions.activation.activeItem).toBe(engine.extensions.batch.items[4])
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		app.destroy()
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(engine.options.get('owner')).toBeUndefined()
	})
})
