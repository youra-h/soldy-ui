import { describe, it, expect, vi } from 'vitest'
import { TAvatar, TAvatarGroup } from '../src'

describe('Avatar', () => {
	it('preserves formatted Unicode initials and drops loaded state on a new source', () => {
		const initials = '\u{1f469}\u{1f3fd}\u200d\u{1f4bb} e\u0301\u{1f1fa}\u{1f1f3}'
		const avatar = new TAvatar({ src: 'a', initials })
		const changed = vi.fn()
		avatar.events.on('change:status', changed)
		avatar.status = 'loaded'
		avatar.status = 'loaded'
		avatar.src = 'b'
		expect(avatar.status).toBe('idle')
		expect(avatar.dataset.toObject()['data-status']).toBe('idle')
		expect(avatar.initials).toBe(initials)
		expect(avatar.getProps()).toMatchObject({ src: 'b', initials, shape: undefined })
		expect(changed).toHaveBeenCalledTimes(2)
		avatar.shape = 'rounded'
		expect(avatar.classes.toArray()).toContain('so-avatar--shape-rounded')
		avatar.shape = undefined
		expect(avatar.classes.toArray()).not.toContain('so-avatar--shape-rounded')
	})
	it.each([0, -1, 1.5, NaN, Infinity])('omits invalid overflow %s', (overflow) => {
		expect(new TAvatarGroup({ overflow }).displayOverflow).toBe('')
	})
	it('exposes explicit overflow without changing child controls', () => {
		const group = new TAvatarGroup({ overflow: 3 })
		expect(group.displayOverflow).toBe('+3')
		expect(group.aria.toObject()).toEqual({ role: 'group' })
		group.overflow = 4
		expect(group.displayOverflow).toBe('+4')
	})
})
