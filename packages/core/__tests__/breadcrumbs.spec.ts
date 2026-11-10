import { describe, it, expect, vi } from 'vitest'
import {
	TBreadcrumbs,
	TBreadcrumbsItem,
	TBreadcrumbsCollectionFacade,
	createEngineBreadcrumbs,
	createEngine,
	createEngineActivation,
} from '../src'

const sources = Array.from({ length: 7 }, (_, index) => ({
	text: String(index),
	href: '/' + index,
	_: { active: index === 6 },
}))
describe('Breadcrumbs collection', () => {
	it('keeps membership in the engine and current state in activation', () => {
		const owner = new TBreadcrumbs({ maxItems: 4 })
		const engine = createEngineBreadcrumbs({ owner, items: sources })
		const { batch, activation, breadcrumbs } = engine.extensions
		expect(batch.items).toHaveLength(7)
		expect(batch.items.every((item) => item instanceof TBreadcrumbsItem)).toBe(true)
		expect(activation.activeItem).toBe(batch.items[6])
		expect(batch.items.filter((item) => item.aria.get('aria-current') === 'page')).toEqual([
			batch.items[6],
		])
		expect(breadcrumbs.overflowEntries.map((entry) => entry.item.text)).toEqual([
			'1',
			'2',
			'3',
			'4',
		])
		expect(batch.items.filter((item) => breadcrumbs.isCollapsed(item))).toHaveLength(4)
		const identities = [...batch.items]
		owner.maxItems = 0
		expect(breadcrumbs.overflowEntries).toEqual([])
		expect(batch.items).toEqual(identities)
		expect(activation.activeItem).toBe(identities[6])
	})
	it.each([createEngine, createEngineActivation, createEngineBreadcrumbs])(
		'completes a prefilled external engine without replacing it (%s)',
		(create) => {
			const engine = create({ items: sources })
			const owner = new TBreadcrumbs({ size: 'lg' })
			const facade = new TBreadcrumbsCollectionFacade({}, { owner, engine })
			facade.bindOwner()
			expect(facade.engine).toBe(engine)
			expect(
				facade.items.every(
					(item) => item instanceof TBreadcrumbsItem && item.size === 'lg',
				),
			).toBe(true)
			expect(facade.activeItem).toBe(facade.items[6])
			facade.releaseOwner()
			owner.size = 'sm'
			expect(facade.items.every((item) => item.size === 'lg')).toBe(true)
		},
	)
	it('uses standard explicit activation and preserves cancellation and deletion semantics', () => {
		const engine = createEngineBreadcrumbs({ items: [{ text: 'First' }, { text: 'Last' }] })
		const { activation, batch, plain } = engine.extensions
		const [first, last] = batch.items
		expect(activation.activeItem).toBeUndefined()
		if (!first || !last) throw new Error('Missing item')
		activation.activate(last)
		const changes = vi.fn()
		activation.events.on('change:activation', changes)
		activation.events.on('item:activate:before', (event) => {
			if (event.item === first) event.preventDefault()
		})
		expect(activation.activate(first)).toBe(false)
		expect(activation.activeItem).toBe(last)
		expect(changes).not.toHaveBeenCalled()
		plain.remove(last)
		expect(activation.activeItem).toBeUndefined()
		expect(first.aria.get('aria-current')).toBeUndefined()
	})
	it('follows item identity through reorder, removal, patch and window changes', () => {
		const owner = new TBreadcrumbs({ maxItems: 3 })
		const engine = createEngineBreadcrumbs({ owner, items: sources })
		const { batch, plain, breadcrumbs } = engine.extensions
		const hidden = batch.items[1]
		if (!hidden) throw new Error('Missing hidden ancestor')
		const proxy = breadcrumbs.overflowEntries[0]?.menuItem
		hidden.text = 'Renamed'
		expect(proxy?.text).toBe('Renamed')
		hidden.href = undefined
		expect(proxy?.disabled).toBe(true)
		plain.remove(hidden)
		expect(breadcrumbs.overflowEntries.some((entry) => entry.item === hidden)).toBe(false)
		expect(batch.items).not.toContain(hidden)
	})
	it('keeps cancelled mutations and normalized owner props in their own layers', () => {
		const owner = new TBreadcrumbs({ maxItems: 2 })
		expect(owner.maxItems).toBe(3)
		owner.events.on('change:maxItems:before', (event) => event.preventDefault())
		owner.maxItems = 0
		expect(owner.maxItems).toBe(3)
		const engine = createEngineBreadcrumbs({ owner, items: sources })
		const { plain, batch, breadcrumbs } = engine.extensions
		const before = [...batch.items]
		plain.events.on('item:remove:before', (event) => event.preventDefault())
		if (before[1]) plain.remove(before[1])
		expect(batch.items).toEqual(before)
		expect(breadcrumbs.overflowEntries).toHaveLength(5)
	})
	it('counts only present shown items and transfers the overflow anchor on first-item changes', () => {
		const owner = new TBreadcrumbs({ maxItems: 3 })
		const engine = createEngineBreadcrumbs({ owner, items: sources })
		const { batch, plain, breadcrumbs } = engine.extensions
		const first = batch.items[0],
			next = batch.items[1],
			last = batch.items[6]
		if (!first || !next || !last) throw new Error('Missing items')
		first.visible = false
		expect(breadcrumbs.firstItem).toBe(next)
		expect(breadcrumbs.isCollapsed(next)).toBe(false)
		expect(breadcrumbs.overflowEntries.map((entry) => entry.item.text)).toEqual([
			'2',
			'3',
			'4',
			'5',
		])
		first.visible = true
		plain.move(last, 0)
		expect(breadcrumbs.firstItem).toBe(last)
		expect(breadcrumbs.isCollapsed(last)).toBe(false)
		expect(engine.extensions.activation.activeItem).toBe(last)
	})
	it('uses programmatic meta and preserves item identity with trackBy patches', () => {
		const owner = new TBreadcrumbs()
		const facade = new TBreadcrumbsCollectionFacade(
			{
				trackBy: (item) => item.href,
				items: [
					{ text: 'A', href: '/a' },
					{ text: 'B', href: '/b' },
				],
			},
			{ owner },
		)
		const [first, last] = facade.items
		if (!first || !last) throw new Error('Missing items')
		facade.extensions.meta.apply(first, { active: true })
		expect(facade.activeItem).toBe(first)
		facade.items = [
			{ text: 'Renamed A', href: '/a' },
			{ text: 'B', href: '/b' },
		]
		expect(facade.items[0]).toBe(first)
		expect(first.text).toBe('Renamed A')
		expect(facade.activeItem).toBe(first)
		expect(first.dataset.get('selected')).toBe('true')
	})
	it('marks the active hidden ancestor on its native menu proxy and follows activation', () => {
		const owner = new TBreadcrumbs({ maxItems: 3 })
		const engine = createEngineBreadcrumbs({ owner, items: sources })
		const { batch, activation, breadcrumbs } = engine.extensions
		const firstHidden = batch.items[1],
			nextHidden = batch.items[2]
		if (!firstHidden || !nextHidden) throw new Error('Missing ancestors')
		activation.activate(firstHidden)
		expect(breadcrumbs.overflowEntries[0]?.menuItem.aria.get('aria-current')).toBe('page')
		expect(firstHidden.visible).toBe(true)
		activation.activate(nextHidden)
		expect(breadcrumbs.overflowEntries[0]?.menuItem.aria.get('aria-current')).toBeUndefined()
		expect(breadcrumbs.overflowEntries[1]?.menuItem.aria.get('aria-current')).toBe('page')
	})

	it('suppresses native navigation for disabled items while retaining their href value', () => {
		const item = new TBreadcrumbsItem({ href: '/settings', disabled: true })
		expect(item.href).toBe('/settings')
		expect(item.attrs.get('href')).toBeUndefined()
		item.href = '/updated'
		expect(item.attrs.get('href')).toBeUndefined()
		item.disabled = false
		expect(item.attrs.get('href')).toBe('/updated')
		item.disabled = true
		expect(item.attrs.get('href')).toBeUndefined()
		expect(item.href).toBe('/updated')
	})
})
