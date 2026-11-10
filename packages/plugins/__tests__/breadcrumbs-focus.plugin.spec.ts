// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest'
import { TBreadcrumbs } from '@soxa-ui/core'
import { TBreadcrumbsFocusPlugin, TElementPlugin, TPluginBundle } from '../src'
const bundles: TPluginBundle[] = []
afterEach(() => {
	bundles.splice(0).forEach((bundle) => bundle.destroy())
	document.body.innerHTML = ''
})
const frame = () => new Promise(requestAnimationFrame)
async function setup() {
	const owner = new TBreadcrumbs({
		items: [
			{ text: 'Home', href: '#home' },
			{ text: 'Section', href: '#section' },
			{ text: 'Page' },
		],
	})
	const root = document.createElement('nav')
	root.tabIndex = -1
	document.body.append(root)
	const bundle = new TPluginBundle(owner).use(TElementPlugin).use(TBreadcrumbsFocusPlugin)
	bundles.push(bundle)
	const element = bundle.get(TElementPlugin)
	if (!element) throw new Error('Missing element plugin')
	element.element = root
	const draw = () => {
		root.replaceChildren(
			...owner.entries.map((entry) => {
				const link = document.createElement(entry.item.href === undefined ? 'span' : 'a')
				if (entry.item.href) link.setAttribute('href', entry.item.href)
				link.dataset.breadcrumbIndex = String(entry.index)
				link.textContent = entry.item.text
				return link
			}),
		)
	}
	draw()
	await frame()
	const link = root.querySelector('a[href="#section"]')
	if (!(link instanceof HTMLAnchorElement)) throw new Error('Missing section link')
	link.focus()
	return { owner, root, element, draw }
}
describe('Breadcrumbs focus lifecycle', () => {
	it('uses the landmark when all focusable locations disappear', async () => {
		const { owner, root, draw } = await setup()
		owner.items = [{ text: 'Page' }]
		draw()
		await frame()
		expect(document.activeElement).toBe(root)
	})
	it('does not take focus back after a deliberate move outside', async () => {
		const { owner, draw } = await setup()
		owner.items = [{ text: 'Page' }]
		draw()
		const outside = document.createElement('button')
		document.body.append(outside)
		outside.focus()
		await frame()
		expect(document.activeElement).toBe(outside)
	})
	it('cancels pending repair when the root is removed', async () => {
		const { owner, root, element, draw } = await setup()
		const focus = vi.spyOn(root, 'focus')
		owner.items = [{ text: 'Page' }]
		draw()
		element.element = null
		root.remove()
		await frame()
		expect(focus).not.toHaveBeenCalled()
	})
})
