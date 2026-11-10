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
	{ text: 'Current' },
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
		expect(app.root().querySelectorAll('ol > li')).toHaveLength(3)
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
				item={({ item, index, current }) => (
					<b>
						{index}:{item.text}:{String(current)}
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
		expect(english.replace(/<!--[\s\S]*?-->/g, '')).toContain('0:Home:false')
		expect(russian).toContain('Навигационная цепочка')
	})
})
