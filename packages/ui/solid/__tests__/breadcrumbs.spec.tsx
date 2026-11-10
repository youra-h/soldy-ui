import { describe, it, expect } from 'vitest'
import { createSignal } from 'solid-js'
import { Breadcrumbs } from '@soxa-ui/solid'
import { mount, find, nextFrame } from './mount'

const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current' },
]

describe('Breadcrumbs', () => {
	it('has one list position for overflow and retains native menu links', async () => {
		const app = mount(() => <Breadcrumbs items={items} maxItems={3} />)

		await nextFrame()

		expect(app.root().querySelectorAll('ol > li')).toHaveLength(3)
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
			<Breadcrumbs
				items={items}
				maxItems={max()}
				item={({ item, index }) => (
					<b>
						{index}:{item.text}
					</b>
				)}
			/>
		))

		expect(app.root().querySelector('a b')?.textContent).toBe('0:Home')

		setMax(0)
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelector('button')).toBeNull()
	})
})
