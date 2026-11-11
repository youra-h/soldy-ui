import { describe, expect, it } from 'vitest'
import { TAvatar } from '@soxa-ui/core'
import { AvatarDescriptor, AvatarGroupDescriptor } from '../content/descriptors'
import { createAdapterContext } from '../protected/adapter'

describe('Avatar descriptors without DOM', () => {
	it('constructs and changes src on the server without DOM or image globals', () => {
		const ctrl = new TAvatar({ src: 'a', initials: 'AL' })
		const adapter = createAdapterContext(AvatarDescriptor(), {
			ctrl,
			props: { aria_label: 'Ada' },
		})
		expect(ctrl.status).toBe('idle')
		ctrl.src = 'b'
		expect(ctrl.status).toBe('idle')
		expect(ctrl.aria.toObject()).toMatchObject({ role: 'img', 'aria-label': 'Ada' })
		expect(
			AvatarDescriptor()
				.getProps()
				.find((p) => p.name.name === 'status')?.protected,
		).toBe(true)
		adapter.destroy()
	})
	it('keeps an unnamed group accessible while unnamed avatars are decorative', () => {
		const avatar = createAdapterContext(AvatarDescriptor(), {})
		const group = createAdapterContext(AvatarGroupDescriptor(), {})
		expect(avatar.instance.aria.toObject()['aria-hidden']).toBe('true')
		expect(group.instance.aria.toObject()).toEqual({ role: 'group' })
		avatar.destroy()
		group.destroy()
	})
})
