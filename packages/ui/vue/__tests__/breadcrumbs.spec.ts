import { hydrate, unmountHydrated } from './hydrate'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { Breadcrumbs, LocaleProvider } from '@soxa-ui/vue'
import { enUS, ruRU, extendLocale } from '@soxa-ui/plugins'
import type { TLocale } from '@soxa-ui/plugins'
const items = [
	{ text: 'Home', href: '#home' },
	{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
	{ text: 'Group' },
	{ text: 'Phones', href: '#phones' },
	{ text: 'Current' },
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
	it('hydrates localized server markup including its teleported menu panel', async () => {
		const { server, client, warnings } = await hydrate(() =>
			h(LocaleProvider, { locale: ruRU }, () => h(Breadcrumbs, { items, maxItems: 3 })),
		)
		expect(warnings).toEqual([])
		expect(client.querySelector('nav')?.getAttribute('aria-label')).toBe(
			'Навигационная цепочка',
		)
		expect(client.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		expect(client.querySelector('button')?.getAttribute('aria-controls')).toBe(
			server.querySelector('button')?.getAttribute('aria-controls'),
		)
	})
	it('prefers a surviving duplicate by identity over an earlier equal item', async () => {
		const same = { text: 'Repeated', href: '#same' },
			survivor = { text: 'Repeated', href: '#same' }
		const wrapper = await render({
			items: [same, { text: 'Middle', href: '#middle' }, survivor, { text: 'Page' }],
			maxItems: 0,
		})
		const focused = wrapper.element.querySelectorAll('a')[2]
		if (!(focused instanceof HTMLAnchorElement)) throw new Error('Missing duplicate link')
		focused.focus()
		await wrapper.setProps({ items: [same, survivor, { text: 'Page' }] })
		await new Promise(requestAnimationFrame)
		expect(document.activeElement?.getAttribute('data-breadcrumb-index')).toBe('1')
	})
	it('preserves locations and repairs removed focus without taking outside focus', async () => {
		const wrapper = await render({ maxItems: 0 })
		const focused = wrapper.element.querySelector('a[href="#phones"]')
		if (!(focused instanceof HTMLAnchorElement)) throw new Error('Missing phone link')
		focused.focus()
		await wrapper.setProps({ items: items.slice(1) })
		await new Promise(requestAnimationFrame)
		expect(document.activeElement?.getAttribute('href')).toBe('#phones')
		await wrapper.setProps({ items: [{ text: 'Home', href: '#home' }, { text: 'Current' }] })
		await new Promise(requestAnimationFrame)
		expect(document.activeElement?.getAttribute('href')).toBe('#home')
		const outside = document.createElement('button')
		document.body.append(outside)
		outside.focus()
		await wrapper.setProps({ items: [{ text: 'Other' }] })
		await new Promise(requestAnimationFrame)
		expect(document.activeElement).toBe(outside)
	})
	it('renders independent localized trails on the server', async () => {
		const [english, russian] = await Promise.all([
			renderToString(
				h(LocaleProvider, { locale: enUS }, () => h(Breadcrumbs, { items, maxItems: 3 })),
			),
			renderToString(
				h(LocaleProvider, { locale: ruRU }, () => h(Breadcrumbs, { items, maxItems: 3 })),
			),
		])
		expect(english).toContain('aria-label="Breadcrumbs"')
		expect(russian).toContain('aria-label="Навигационная цепочка')
		expect(english).toContain('aria-current="page"')
		expect(english).not.toContain('href="#catalog"')
	})

	it('renders native navigation and a single current location without a trailing separator', async () => {
		const wrapper = await render()
		expect(wrapper.element.tagName).toBe('NAV')
		expect(wrapper.attributes('aria-label')).toBe('Breadcrumbs')
		expect(wrapper.findAll('ol > li')).toHaveLength(3)
		expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
		expect(wrapper.get('[aria-current="page"]').element.tagName).toBe('SPAN')
		expect(wrapper.findAll('.so-breadcrumbs__separator')).toHaveLength(2)
		expect(wrapper.get('a').attributes('href')).toBe('#home')
	})
	it('opens hidden entries as native links, with original slot indices and non-link text disabled', async () => {
		const wrapper = await render()
		await wrapper.get('button').trigger('click')
		await nextTick()
		await new Promise(requestAnimationFrame)
		const links = [...document.querySelectorAll('a[role="menuitem"]')]
		expect(links).toHaveLength(3)
		expect(links[0]?.getAttribute('href')).toBe('#catalog')
		expect(links[0]?.getAttribute('target')).toBe('_blank')
		expect(links[0]?.getAttribute('rel')).toBe('external')
		expect(links[1]?.hasAttribute('href')).toBe(false)
		expect(links[1]?.getAttribute('aria-disabled')).toBe('true')
		expect(links.every((link) => link.querySelector('a,button') === null)).toBe(true)
		await wrapper.setProps({ maxItems: 0 })
		expect(wrapper.find('button').exists()).toBe(false)
		expect(wrapper.findAll('ol > li')).toHaveLength(5)
	})
	it('keeps the shell when slots replace visible and hidden contents', async () => {
		const wrapper = mount(Breadcrumbs, {
			props: { items, maxItems: 3 },
			slots: {
				item: ({ item, index, current }) =>
					h('strong', String(index) + ':' + item.text + ':' + current),
				'item-leading': ({ index }) => h('i', String(index)),
				'item-trailing': () => h('b', '!'),
			},
			attachTo: document.body,
		})
		wrappers.push(wrapper)
		await nextTick()
		await new Promise(requestAnimationFrame)
		expect(wrapper.get('a strong').text()).toBe('0:Home:false')
		await wrapper.get('button').trigger('click')
		await nextTick()
		await new Promise(requestAnimationFrame)
		expect(document.querySelector('a[href="#catalog"] strong')?.textContent).toBe(
			'1:Catalog:false',
		)
	})
	it('updates localized names and accepts old custom locales and partial new translations', async () => {
		const { breadcrumbs: _new, ...old } = enUS.translations
		const custom: TLocale = { tag: 'en-GB', translations: old }
		const wrapper = mount(LocaleProvider, {
			props: { locale: custom },
			slots: { default: () => h(Breadcrumbs, { items, maxItems: 3 }) },
		})
		wrappers.push(wrapper)
		expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumbs')
		await wrapper.setProps({ locale: ruRU })
		expect(wrapper.get('nav').attributes('aria-label')).toBe('Навигационная цепочка')
		expect(wrapper.get('button').attributes('aria-label')).toBe('Показать скрытые звенья')
		const localized = extendLocale(custom, {
			translations: { breadcrumbs: { overflow: 'More pages' } },
		})
		await wrapper.setProps({ locale: localized })
		expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumbs')
		expect(wrapper.get('button').attributes('aria-label')).toBe('More pages')
	})
})
