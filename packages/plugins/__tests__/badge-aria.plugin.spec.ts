import { describe, expect, it, vi } from 'vitest'
import { TBadge } from '@soxa-ui/core'
import { TAriaPlugin, TBadgeAriaPlugin, TPluginBundle } from '../src'

describe('BadgeAriaPlugin', () => {
	it('owns only role/hidden and removes every subscription on destroy', () => {
		const badge = new TBadge({ dot: true })
		const bundle = new TPluginBundle(badge).use(TAriaPlugin).use(TBadgeAriaPlugin)
		const name = bundle.get(TAriaPlugin)

		if (!name) throw new Error('Missing name plugin')

		expect(badge.aria.valueOf()).toEqual({ 'aria-hidden': 'true' })

		name.label = 'Online'

		expect(badge.aria.valueOf()).toMatchObject({ 'aria-label': 'Online', role: 'img' })
		expect(badge.aria.valueOf()['aria-hidden']).toBeUndefined()

		name.label = undefined
		badge.dot = false

		expect(badge.aria.valueOf()).toEqual({})

		name.labelledBy = 'status'

		expect(badge.aria.valueOf()).toMatchObject({ 'aria-labelledby': 'status', role: 'img' })

		bundle.remove(TBadgeAriaPlugin)

		const write = vi.spyOn(badge.aria, 'add')

		badge.dot = true
		name.labelledBy = undefined

		expect(write.mock.calls.some(([key]) => key === 'role' || key === 'aria-hidden')).toBe(
			false,
		)

		bundle.destroy()
	})
})
