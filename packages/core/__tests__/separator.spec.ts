import { describe, it, expect, vi } from 'vitest'
import { TSeparator, TComponentView } from '@soxa-ui/core'

const orientations = ['horizontal', 'vertical'] as const

describe('Separator', () => {
	it('defaults to a semantic horizontal boundary on a neutral div', () => {
		const ctrl = new TSeparator()

		expect(ctrl).toBeInstanceOf(TComponentView)
		expect(ctrl.tag).toBe('div')
		expect(ctrl.getProps()).toMatchObject({ orientation: 'horizontal', decorative: false })
		expect(ctrl.aria.toObject()).toEqual({
			role: 'separator',
			'aria-orientation': 'horizontal',
		})
		expect(ctrl.classes.toArray()).toEqual([
			'so-separator',
			'so-separator--orientation-horizontal',
		])
		expect('focused' in ctrl).toBe(false)
	})

	for (const orientation of orientations)
		for (const decorative of [false, true]) {
			it(orientation + ' / decorative=' + decorative, () => {
				const ctrl = new TSeparator({ orientation, decorative })

				expect(ctrl.aria.toObject()).toEqual(
					decorative
						? { role: 'none' }
						: { role: 'separator', 'aria-orientation': orientation },
				)
				expect(ctrl.classes.toArray()).toContain('so-separator--orientation-' + orientation)
			})
		}

	it('retains the latest axis in decorative mode and synchronizes outputs before events', () => {
		const ctrl = new TSeparator()
		const orientation = vi.fn(() => expect(ctrl.aria.has('aria-orientation')).toBe(false))
		ctrl.events.on('change:orientation', orientation)
		const decorative = vi.fn()
		ctrl.events.on('change:decorative', decorative)

		ctrl.decorative = true
		ctrl.decorative = true
		ctrl.orientation = 'vertical'
		ctrl.orientation = 'vertical'
		ctrl.decorative = false

		expect(orientation).toHaveBeenCalledExactlyOnceWith({
			newValue: 'vertical',
			oldValue: 'horizontal',
		})
		expect(decorative.mock.calls).toEqual([
			[{ newValue: true, oldValue: false }],
			[{ newValue: false, oldValue: true }],
		])
		expect(ctrl.aria.toObject()).toEqual({ role: 'separator', 'aria-orientation': 'vertical' })
		expect(ctrl.classes.toArray()).not.toContain('so-separator--orientation-horizontal')
		expect(ctrl.getProps()).toMatchObject({ orientation: 'vertical', decorative: false })
	})
})
