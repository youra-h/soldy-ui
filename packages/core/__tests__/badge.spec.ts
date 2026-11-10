import { describe, it, expect, vi } from 'vitest'
import { TBadge } from '../src'

describe('Badge model', () => {
	it.each([
		[0, '0'],
		[99, '99'],
		[100, '99+'],
		[-2.5, '-2.5'],
		['120', '120'],
		[NaN, ''],
		[Infinity, ''],
		[-Infinity, ''],
	] as const)('formats %s as %s', (value, text) => {
		const badge = new TBadge({ value })

		expect(badge.displayValue).toBe(text)
		expect(badge.value).toBe(value)
	})

	it.each([NaN, Infinity, -Infinity, -1])('uses 99 for invalid max %s', (max) => {
		expect(new TBadge({ value: 120, max }).displayValue).toBe('99+')
	})

	it('preserves value through dot/max changes and exposes complete props', () => {
		const badge = new TBadge({ value: 120 })

		badge.max = 9

		expect(badge.displayValue).toBe('9+')

		badge.dot = true

		expect(badge.displayValue).toBe('')
		expect(badge.dataset.valueOf()['data-dot']).toBe('true')

		badge.dot = false

		expect(badge.displayValue).toBe('9+')
		expect(badge.getProps()).toMatchObject({
			value: 120,
			max: 9,
			dot: false,
			tag: 'span',
			view: undefined,
		})
		expect(badge.classes.valueOf()).not.toContain('so-badge--view-undefined')
	})

	it('allows correcting and cancelling value changes, and ignores repeated NaN', () => {
		const badge = new TBadge()

		badge.events.on('change:value:before', (event) => {
			if (event.value === 'cancel') event.preventDefault()
			if (event.value === 'correct') event.value = 7
		})

		const changed = vi.fn()
		badge.events.on('change:value', changed)

		badge.value = 'cancel'

		expect(badge.value).toBe('')

		badge.value = 'correct'

		expect(badge.value).toBe(7)

		badge.value = NaN
		badge.value = NaN

		expect(changed).toHaveBeenCalledTimes(2)
	})
})
