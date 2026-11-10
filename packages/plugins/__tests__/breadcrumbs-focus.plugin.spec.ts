// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest'
import { TBreadcrumbs, createEngineBreadcrumbs } from '@soxa-ui/core'
import type { IBreadcrumbsItem, IBreadcrumbsItemProps } from '@soxa-ui/core'
import {
	TBreadcrumbsFocusPlugin,
	TActionPlugin,
	TCollectionBundlesPlugin,
	TCollectionElements,
	TElementPlugin,
	TPluginBundle,
} from '../src'

const bundles: TPluginBundle[] = []
const frame = () => new Promise(requestAnimationFrame)

afterEach(() => {
	bundles
		.splice(0)
		.reverse()
		.forEach((bundle) => bundle.destroy())
	document.body.innerHTML = ''
})

function required<T>(value: T | undefined | null): T {
	if (value == null) throw new Error('Missing test fixture')
	return value
}

async function setup(
	sources: Partial<IBreadcrumbsItemProps>[] = [
		{ text: 'Home', href: '#home' },
		{ text: 'Section', href: '#section' },
		{ text: 'Page' },
	],
) {
	const owner = new TBreadcrumbs({ maxItems: 0 })
	const engine = createEngineBreadcrumbs({ owner, items: sources })
	const root = document.createElement('nav')
	const list = document.createElement('ol')

	root.tabIndex = -1
	root.append(list)
	document.body.append(root)
	const bundle = new TPluginBundle(owner)
		.use(TElementPlugin)
		.use(TCollectionBundlesPlugin)
		.use(TCollectionElements)
		.use(TBreadcrumbsFocusPlugin)

	bundles.push(bundle)
	const registry = required(bundle.get(TCollectionBundlesPlugin))
	const element = required(bundle.get(TElementPlugin))
	const links = new Map<IBreadcrumbsItem, HTMLElement>()
	const mounted = new Map<IBreadcrumbsItem, TPluginBundle>()

	registry.bindEngine(engine)
	element.element = root
	const draw = () => {
		for (const [item, itemBundle] of mounted) {
			registry.release(itemBundle, item)
			itemBundle.destroy()
		}
		mounted.clear()
		links.clear()
		list.replaceChildren()

		for (const item of engine.extensions.batch.items) {
			const node = document.createElement('li')
			const link = document.createElement('a')

			link.className = 'so-breadcrumbs__link'
			if (item.href !== undefined) link.setAttribute('href', item.href)
			link.textContent = item.text
			node.append(link)
			if (engine.extensions.breadcrumbs.isCollapsed(item)) node.style.display = 'none'
			if (
				item === engine.extensions.breadcrumbs.firstItem &&
				engine.extensions.breadcrumbs.overflowEntries.length
			) {
				const trigger = document.createElement('button')

				trigger.className = 'so-breadcrumbs__trigger'
				node.append(trigger)
			}
			list.append(node)
			const itemBundle = new TPluginBundle(item).use(TElementPlugin)

			bundles.push(itemBundle)
			mounted.set(item, itemBundle)
			required(itemBundle.get(TElementPlugin)).element = node
			registry.register(itemBundle, item)
			links.set(item, link)
		}
	}

	draw()
	await frame()
	const section = required(engine.extensions.batch.items[1])
	const link = (item: IBreadcrumbsItem) => required(links.get(item))

	link(section).focus()
	return { owner, engine, root, element, section, link, draw }
}

describe('Breadcrumbs focus through the collection registry', () => {
	it('uses the landmark when all focusable locations disappear', async () => {
		const { engine, root, draw } = await setup()

		engine.extensions.batch.update([{ text: 'Page' }])
		draw()
		await frame()
		expect(document.activeElement).toBe(root)
	})

	it('preserves item identity across a reorder and a new mounting', async () => {
		const { engine, section, link, draw } = await setup()

		engine.extensions.plain.move(section, 0)
		draw()
		await frame()
		expect(document.activeElement).toBe(link(section))
	})

	it('passes a collapsed location to the overflow trigger without removing its item', async () => {
		const { owner, engine, root, section, draw } = await setup(
			Array.from({ length: 6 }, (_, index) => ({ text: String(index), href: '#' + index })),
		)

		owner.maxItems = 3
		draw()
		await frame()
		expect(engine.extensions.batch.items).toContain(section)
		expect(document.activeElement).toBe(root.querySelector('.so-breadcrumbs__trigger'))
	})

	it('returns a focused menu proxy to its surviving crumb when the trail expands', async () => {
		const { owner, engine, section, draw, link } = await setup(
			Array.from({ length: 6 }, (_, index) => ({ text: String(index), href: '#' + index })),
		)

		owner.maxItems = 3
		draw()
		const { menu, overflowEntries } = engine.extensions.breadcrumbs
		const entry = required(overflowEntries.find(({ item }) => item === section))
		const panel = document.createElement('div')
		const proxyLink = document.createElement('a')

		panel.id = 'breadcrumb-test-menu'
		menu.aria.add('id', panel.id)
		proxyLink.href = '#proxy'
		panel.append(proxyLink)
		document.body.append(panel)
		const proxyBundle = new TPluginBundle(entry.menuItem).use(TElementPlugin).use(TActionPlugin)

		bundles.push(proxyBundle)
		required(proxyBundle.get(TElementPlugin)).element = proxyLink
		menu.open = true
		await frame()
		proxyLink.focus()
		expect(entry.menuItem.focused).toBe(true)
		owner.maxItems = 0
		draw()
		await frame()
		expect(document.activeElement).toBe(link(section))
	})

	it('leaves focus on an item whose removal was cancelled', async () => {
		const { engine, section, link } = await setup()

		engine.extensions.plain.events.on('item:remove:before', (event) => event.preventDefault())
		engine.extensions.plain.remove(section)
		await frame()
		expect(document.activeElement).toBe(link(section))
	})

	it('captures current focus after a cancelled operation and a later window change', async () => {
		const { owner, engine, section, link, draw } = await setup(
			Array.from({ length: 6 }, (_, index) => ({ text: String(index), href: '#' + index })),
		)
		const last = required(engine.extensions.batch.items.at(-1))

		engine.extensions.plain.events.on('item:remove:before', (event) => event.preventDefault())
		engine.extensions.plain.remove(section)
		link(last).focus()
		owner.maxItems = 3
		draw()
		await frame()
		expect(document.activeElement).toBe(link(last))
	})

	it('waits for the replacement item to announce its element', async () => {
		const { engine, draw, link } = await setup()

		engine.extensions.batch.update([{ text: 'New', href: '#new' }])
		await frame()
		draw()
		await frame()
		expect(document.activeElement).toBe(link(required(engine.extensions.batch.items[0])))
	})

	it('does not take focus back after a deliberate move outside', async () => {
		const { engine, draw } = await setup()

		engine.extensions.batch.update([{ text: 'Page' }])
		draw()
		const outside = document.createElement('button')

		document.body.append(outside)
		outside.focus()
		await frame()
		expect(document.activeElement).toBe(outside)
	})

	it('cancels pending repair when the root is removed', async () => {
		const { engine, root, element, draw } = await setup()
		const focus = vi.spyOn(root, 'focus')

		engine.extensions.batch.update([{ text: 'Page' }])
		draw()
		element.element = null
		root.remove()
		await frame()
		expect(focus).not.toHaveBeenCalled()
	})
})
