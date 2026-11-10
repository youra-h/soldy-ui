import { createEngineBreadcrumbs } from '@soxa-ui/core'
import { describe, it, expect } from 'vitest'
import { act, StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Breadcrumbs, LocaleProvider } from '@soxa-ui/react'
import { ruRU } from '@soxa-ui/plugins'
import { mount, find, nextFrame } from './mount'

const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current', _: { active: true } },
]

describe('Breadcrumbs', () => {
	it('keeps list positions and native links through overflow and dynamic changes', async () => {
		const app = mount(
			<StrictMode>
				<Breadcrumbs items={items} maxItems={3} />
			</StrictMode>,
		)

		await nextFrame()

		expect(app.root().tagName).toBe('NAV')
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)

		act(() => find(app.root(), 'button', HTMLButtonElement).click())
		await nextFrame()
		const row = find(document, 'a[role="menuitem"][href="#catalog"]', HTMLAnchorElement)

		expect(row.target).toBe('_blank')
		expect(row.rel).toBe('external')

		const canceled = new MouseEvent('click', { bubbles: true, cancelable: true })

		row.addEventListener('click', (event) => event.preventDefault(), {
			capture: true,
			once: true,
		})
		act(() => row.dispatchEvent(canceled))
		expect(canceled.defaultPrevented).toBe(true)

		app.render(<Breadcrumbs items={items} maxItems={0} />)
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(5)
		expect(app.root().querySelector('button')).toBeNull()
	})

	it('supplies original slot scopes and keeps two server locales independent', () => {
		const english = renderToString(
			<Breadcrumbs
				items={items}
				maxItems={3}
				item={({ item, active }) => (
					<b>
						{item.text}:{String(active)}
					</b>
				)}
			/>,
		)
		const russian = renderToString(
			<LocaleProvider locale={ruRU}>
				<Breadcrumbs items={items} />
			</LocaleProvider>,
		)

		expect(english).toContain('aria-label="Breadcrumbs"')
		expect(english.replace(/<!--[\s\S]*?-->/g, '')).toContain('Home:false')
		expect(russian).toContain('Навигационная цепочка')
	})
	it('keeps declarative Item identities through collapse, activation and cleanup', async () => {
		const engine = createEngineBreadcrumbs()
		const content = (maxItems: number) => (
			<Breadcrumbs engine={engine} maxItems={maxItems}>
				<Breadcrumbs.Item text="Home" href="#home" />
				<Breadcrumbs.Item text="Catalog" href="#catalog" />
				<Breadcrumbs.Item text="Group" />
				<Breadcrumbs.Item text="Phones" href="#phones" />
				<Breadcrumbs.Item text="Current" active />
			</Breadcrumbs>
		)
		const app = mount(<StrictMode>{content(3)}</StrictMode>)
		await nextFrame()
		const before = [...engine.extensions.batch.items]
		expect(before).toHaveLength(5)
		expect(engine.extensions.activation.activeItem).toBe(before[4])
		expect(
			[...app.root().querySelectorAll('ol>li')].filter(
				(node) => node instanceof HTMLElement && node.style.display !== 'none',
			),
		).toHaveLength(2)
		app.render(<StrictMode>{content(0)}</StrictMode>)
		expect(engine.extensions.batch.items).toEqual(before)
		expect(app.root().querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		app.render(<div />)
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(engine.options.get('owner')).toBeUndefined()
	})
})
