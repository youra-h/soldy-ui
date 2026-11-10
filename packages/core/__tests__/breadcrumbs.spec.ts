import { describe, it, expect, vi } from 'vitest'
import { TBreadcrumbs } from '../src'

const items = Array.from({ length: 7 }, (_, index) => ({
	text: String(index),
	href: index === 6 ? undefined : '/' + index,
}))

describe('Breadcrumbs projection', () => {
	it('handles empty, singleton, current links and text ancestors', () => {
		const owner = new TBreadcrumbs()

		expect(owner.entries).toEqual([])

		owner.items = [{ text: 'Current', href: '/current' }]
		expect(owner.entries[0]?.aria).toEqual({ 'aria-current': 'page' })
		expect(owner.entries[0]?.attrs.href).toBe('/current')

		owner.items = [{ text: 'Group' }, { text: 'Page' }]
		expect(owner.entries[0]?.attrs).toEqual({})
		expect(owner.entries.filter((entry) => entry.current)).toHaveLength(1)
	})

	it('includes overflow in the limit and keeps original order and indices', () => {
		const owner = new TBreadcrumbs({ items, maxItems: 4 })

		expect(owner.entries.map((entry) => entry.index)).toEqual([0, 5, 6])
		expect(owner.hiddenEntries.map((entry) => entry.index)).toEqual([1, 2, 3, 4])

		owner.maxItems = 0
		expect(owner.entries).toHaveLength(7)
		expect(owner.hiddenEntries).toEqual([])

		owner.maxItems = 7
		expect(owner.hiddenEntries).toEqual([])
	})
	it.each([
		[1, 3],
		[2, 3],
		[3.9, 3],
		[-1, 5],
		[NaN, 5],
		[Infinity, 5],
		[0, 0],
	])('normalizes %s to %s', (value, expected) => {
		expect(new TBreadcrumbs({ maxItems: value }).maxItems).toBe(expected)
	})

	it('suppresses equivalent arrays while reporting actual link changes', () => {
		const owner = new TBreadcrumbs({ items })
		const listener = vi.fn()

		owner.events.on('change:items', listener)
		owner.items = items.map((item) => ({ ...item }))
		expect(listener).not.toHaveBeenCalled()

		owner.items = [{ text: 'New', href: '/new', target: '_blank', rel: 'external' }]
		expect(listener).toHaveBeenCalledOnce()
		expect(owner.entries[0]?.attrs).toEqual({ href: '/new', target: '_blank', rel: 'external' })
	})
})
