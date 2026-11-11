import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { Avatar, AvatarGroup } from '@soxa-ui/vue'
import { TAvatar, TAvatarGroup } from '@soxa-ui/core'
import { hydrate, unmountHydrated } from './hydrate'

afterEach(unmountHydrated)

describe('Avatar', () => {
	it('renders live external state, fallback and root semantics without duplicate images', async () => {
		const ctrl = new TAvatar({ initials: 'AL' })
		const app = mount(Avatar, { props: { ctrl, aria_label: 'Ada' } })
		expect(app.text()).toBe('AL')
		expect(app.attributes('role')).toBe('img')
		ctrl.src = 'a'
		ctrl.status = 'loaded'
		await nextTick()
		expect(app.find('img').attributes('alt')).toBe('')
		expect(app.find('.so-avatar__fallback').exists()).toBe(false)
		ctrl.src = 'b'
		await nextTick()
		expect(app.find('img').exists()).toBe(false)
		ctrl.initials = 'GH'
		await nextTick()
		expect(app.text()).toBe('GH')
		app.unmount()
		const custom = mount(Avatar, { props: { initials: 'AL' }, slots: { fallback: 'custom' } })
		expect(custom.text()).toBe('custom')
		expect(custom.attributes('aria-hidden')).toBe('true')
		custom.unmount()
	})
	it('keeps explicit children and replaces the count with its scoped slot', async () => {
		const ctrl = new TAvatarGroup({ overflow: 3 })
		const app = mount(AvatarGroup, {
			props: { ctrl },
			slots: {
				default: () => h(Avatar, { initials: 'AL', aria_label: 'Ada' }),
				'overflow-content': ({ count }) => h('b', String(count)),
			},
		})
		expect(app.findAll('.so-avatar')).toHaveLength(1)
		expect(app.find('b').text()).toBe('3')
		expect(app.attributes('aria-hidden')).toBeUndefined()
		ctrl.overflow = 0
		await nextTick()
		expect(app.find('.so-avatar-group__overflow').exists()).toBe(false)
		ctrl.overflow = 4
		await nextTick()
		expect(app.find('b').text()).toBe('4')
		app.unmount()
	})
	it('hydrates server fallback and group nodes in place', async () => {
		const root = await hydrate(() =>
			h(AvatarGroup, { overflow: 3 }, () =>
				h(Avatar, { src: '/avatar.png', initials: 'AL', aria_label: 'Ada' }),
			),
		)
		expect(root.client.querySelectorAll('.so-avatar')).toHaveLength(1)
		expect(root.warnings).toEqual([])
		expect(root.server.textContent).toBe(root.client.textContent)
	})
})
