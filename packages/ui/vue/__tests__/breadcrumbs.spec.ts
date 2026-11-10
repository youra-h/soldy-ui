import { hydrate, unmountHydrated } from './hydrate'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { Breadcrumbs, LocaleProvider } from '@soxa-ui/vue'
import {
	TBreadcrumbsItem,
	TBreadcrumbsCollectionFacade,
	createEngineBreadcrumbs,
	createEngine,
} from '@soxa-ui/core'
import { enUS, ruRU, extendLocale } from '@soxa-ui/plugins'
import type { TLocale } from '@soxa-ui/plugins'
const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current', _: { active: true } },
]
const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
	unmountHydrated()
	wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
	document.body.innerHTML = ''
})
async function render(props: object = {}) {
	const wrapper = mount(Breadcrumbs, {
		props: { items, maxItems: 3, ...props },
		attachTo: document.body,
	})
	wrappers.push(wrapper)
	await nextTick()
	await new Promise(requestAnimationFrame)
	return wrapper
}
describe('Breadcrumbs', () => {
	it('uses engine items and retains collapsed elements and identity while expanding', async () => {
		const engine = createEngineBreadcrumbs({ items })
		const before = [...engine.extensions.batch.items]
		const wrapper = await render({ engine, items: undefined })
		expect(wrapper.findAll('ol > li')).toHaveLength(5)
		expect(wrapper.findAll('ol > li').filter((item) => item.isVisible())).toHaveLength(2)
		expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
		expect(wrapper.get('[aria-current="page"]').element.tagName).toBe('A')
		await wrapper.setProps({ maxItems: 0 })
		expect(wrapper.findAll('ol > li').every((item) => item.isVisible())).toBe(true)
		expect(engine.extensions.batch.items).toEqual(before)
		wrapper.unmount()
		wrappers.splice(wrappers.indexOf(wrapper), 1)
		expect(engine.extensions.batch.items).toEqual(before)
		expect(engine.options.get('owner')).toBeUndefined()
	})
	it('registers declarative Item through the same engine, with explicit active and cleanup', async () => {
		const engine = createEngineBreadcrumbs()
		const current = new TBreadcrumbsItem({ text: 'Current' })
		const wrapper = mount(Breadcrumbs, {
			props: { engine, maxItems: 0 },
			slots: {
				default: () => [
					h(Breadcrumbs.Item, { text: 'Home', href: '#home' }),
					h(Breadcrumbs.Item, { ctrl: current, active: true }),
				],
			},
			attachTo: document.body,
		})
		wrappers.push(wrapper)
		await nextTick()
		expect(engine.extensions.batch.items).toHaveLength(2)
		expect(engine.extensions.activation.activeItem).toBe(current)
		expect(wrapper.get('[aria-current="page"]').text()).toBe('Current')
		wrapper.unmount()
		wrappers.splice(wrappers.indexOf(wrapper), 1)
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(current.rendered).toBe(true)
	})
	it('renders one explicit current location in data and declarative SSR', async () => {
		const data = await renderToString(h(Breadcrumbs, { items, maxItems: 0 }))
		const declarative = await renderToString(
			h(Breadcrumbs, { maxItems: 0 }, () => [
				h(Breadcrumbs.Item, { text: 'Home', href: '#home' }),
				h(Breadcrumbs.Item, { text: 'Catalog', href: '#catalog' }),
				h(Breadcrumbs.Item, { text: 'Page', active: true }),
			]),
		)
		expect(data.match(/aria-current="page"/g) ?? []).toHaveLength(1)
		expect(declarative.match(/aria-current="page"/g) ?? []).toHaveLength(1)
		expect(declarative).toContain('aria-current="page"')
		const unmarked = await renderToString(h(Breadcrumbs, { items: [{ text: 'Unmarked' }] }))
		expect(unmarked).not.toContain('aria-current')
	})
	it('hydrates localized data navigation without warnings', async () => {
		const { client, warnings } = await hydrate(() =>
			h(LocaleProvider, { locale: ruRU }, () => h(Breadcrumbs, { items, maxItems: 3 })),
		)
		expect(warnings).toEqual([])
		expect(client.querySelector('nav')?.getAttribute('aria-label')).toBe(
			ruRU.translations.breadcrumbs?.navigation,
		)
		expect(client.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
	})
	it('completes a base external engine and follows custom activation', async () => {
		const engine = createEngine({ items: [{ text: 'Home', href: '#home' }, { text: 'Page' }] })
		const wrapper = await render({ engine, items: undefined, maxItems: 0 })
		expect(wrapper.find('[aria-current]').exists()).toBe(false)
		const item = engine.extensions.batch.items[0]
		if (!(item instanceof TBreadcrumbsItem)) throw new Error('Item factory was not completed')
		const facade = new TBreadcrumbsCollectionFacade({}, { engine })
		facade.activate(item)
		await nextTick()
		expect(wrapper.get('a').attributes('aria-current')).toBe('page')
	})
	it('opens native hidden links with original attributes and disabled text entries', async () => {
		const wrapper = await render()
		await wrapper.get('button').trigger('click')
		await nextTick()
		await new Promise(requestAnimationFrame)
		const links = [...document.querySelectorAll('a[role="menuitem"]')]
		expect(links).toHaveLength(3)
		expect(links[0]?.getAttribute('href')).toBe('#catalog')
		expect(links[0]?.getAttribute('target')).toBe('_blank')
		expect(links[0]?.getAttribute('rel')).toBe('external')
		expect(links[1]?.getAttribute('aria-disabled')).toBe('true')
		expect(links.every((link) => link.querySelector('a,button') === null)).toBe(true)
	})
	it('keeps native link cancellation and fires one click for an item', async () => {
		const click = vi.fn((event: MouseEvent) => event.preventDefault())
		const wrapper = mount(Breadcrumbs, {
			props: { maxItems: 0 },
			slots: {
				default: () => h(Breadcrumbs.Item, { text: 'Home', href: '#home', onClick: click }),
			},
			attachTo: document.body,
		})
		wrappers.push(wrapper)
		await nextTick()
		const event = new MouseEvent('click', { bubbles: true, cancelable: true })
		wrapper.get('a').element.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(true)
		expect(click).toHaveBeenCalledOnce()
	})
	it('relays complete item slots without a parallel index/current surface', async () => {
		const wrapper = mount(Breadcrumbs, {
			props: { items, maxItems: 0 },
			slots: {
				item: ({ item, text, active }) =>
					h('strong', item.text + ':' + text + ':' + active),
				'item-leading': ({ item }) => h('i', item.text),
			},
			attachTo: document.body,
		})
		wrappers.push(wrapper)
		await nextTick()
		expect(wrapper.get('a strong').text()).toBe('Home:Home:false')
		expect(wrapper.get('[aria-current="page"] strong').text()).toBe('Current:Current:true')
	})
	it('updates locale names and retains compatibility with custom locales without breadcrumbs translations', async () => {
		const { breadcrumbs: _new, ...old } = enUS.translations
		const custom: TLocale = { tag: 'en-GB', translations: old }
		const wrapper = mount(LocaleProvider, {
			props: { locale: custom },
			slots: { default: () => h(Breadcrumbs, { items, maxItems: 3 }) },
		})
		wrappers.push(wrapper)
		expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumbs')
		await wrapper.setProps({ locale: ruRU })
		expect(wrapper.get('button').attributes('aria-label')).toBe(
			ruRU.translations.breadcrumbs?.overflow,
		)
		await wrapper.setProps({
			locale: extendLocale(custom, {
				translations: { breadcrumbs: { overflow: 'More pages' } },
			}),
		})
		expect(wrapper.get('button').attributes('aria-label')).toBe('More pages')
	})
	it('hydrates declarative overflow with one explicit current and stable membership', async () => {
		const { client, warnings } = await hydrate(() =>
			h(Breadcrumbs, { maxItems: 3 }, () => [
				h(Breadcrumbs.Item, { text: 'Home', href: '#home' }),
				h(Breadcrumbs.Item, { text: 'Catalog', href: '#catalog' }),
				h(Breadcrumbs.Item, { text: 'Section', href: '#section' }),
				h(Breadcrumbs.Item, { text: 'Phones', href: '#phones' }),
				h(Breadcrumbs.Item, { text: 'Page', active: true }),
			]),
		)
		expect(warnings).toEqual([])
		expect(client.querySelectorAll('ol>li')).toHaveLength(5)
		expect(client.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		expect(client.querySelector('button')).not.toBeNull()
	})
})
