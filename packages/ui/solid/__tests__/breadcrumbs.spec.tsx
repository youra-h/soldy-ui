import { createEngineBreadcrumbs } from '@soxa-ui/core'
import { describe, it, expect } from 'vitest'
import { createSignal } from 'solid-js'
import { Breadcrumbs } from '@soxa-ui/solid'
import { mount, find, nextFrame } from './mount'

const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current', _: { active: true } },
]

describe('Breadcrumbs', () => {
	it('has one list position for overflow and retains native menu links', async () => {
		const app = mount(() => <Breadcrumbs items={items} maxItems={3} />)

		await nextFrame()

		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)

		find(app.root(), 'button', HTMLButtonElement).click()
		await nextFrame()
		const row = find(document, 'a[role="menuitem"][href="#catalog"]', HTMLAnchorElement)

		expect(row.target).toBe('_blank')
		expect(row.rel).toBe('external')
		expect(row.querySelector('a,button')).toBeNull()
	})

	it('updates the trail and original slot scope', () => {
		const [max, setMax] = createSignal(3)
		const app = mount(() => (
			<Breadcrumbs items={items} maxItems={max()} item={({ item }) => <b>{item.text}</b>} />
		))

		expect(app.root().querySelector('a b')?.textContent).toBe('Home')

		setMax(0)
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelector('button')).toBeNull()
	})
	it('keeps declarative collection membership and explicit active through expansion', () => {
		const engine = createEngineBreadcrumbs()
		const [limit, setLimit] = createSignal(3)
		const app = mount(() => (
			<Breadcrumbs engine={engine} maxItems={limit()}>
				<Breadcrumbs.Item text="Home" href="#home" />
				<Breadcrumbs.Item text="Catalog" href="#catalog" />
				<Breadcrumbs.Item text="Group" />
				<Breadcrumbs.Item text="Phones" href="#phones" />
				<Breadcrumbs.Item text="Current" active />
			</Breadcrumbs>
		))
		const before = [...engine.extensions.batch.items]
		expect(before).toHaveLength(5)
		expect(engine.extensions.activation.activeItem).toBe(before[4])
		setLimit(0)
		expect(engine.extensions.batch.items).toEqual(before)
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		app.destroy()
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(engine.options.get('owner')).toBeUndefined()
	})
})
