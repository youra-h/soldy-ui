import { it, expect } from 'vitest'
import { createRawSnippet, flushSync } from 'svelte'
import { Avatar, AvatarGroup } from '@soxa-ui/svelte'
import { TAvatar, TAvatarGroup } from '@soxa-ui/core'
import { mount } from './mount'
it('renders external image state and custom fallback', () => {
	const ctrl = new TAvatar({ initials: 'AL' })
	const app = mount(Avatar, { ctrl, aria_label: 'Ada' })
	expect(app.root().textContent).toBe('AL')
	ctrl.src = 'a'
	ctrl.status = 'loaded'
	flushSync()
	expect(app.root().querySelector('img')?.getAttribute('alt')).toBe('')
	expect(app.root().querySelector('.so-avatar__fallback')).toBeNull()
	ctrl.src = 'b'
	ctrl.initials = 'GH'
	flushSync()
	expect(app.root().querySelector('img')).toBeNull()
	expect(app.root().textContent).toBe('GH')
	const custom = mount(Avatar, {
		initials: 'AL',
		fallback: createRawSnippet(() => ({ render: () => '<b>custom</b>' })),
	})
	expect(custom.root().textContent).toBe('custom')
})
it('renders the scoped overflow slot and removes invalid counts', () => {
	const ctrl = new TAvatarGroup({ overflow: 3 })
	const content = createRawSnippet<[{ count: number }]>((scope) => ({
		render: () => '<b>' + scope().count + '</b>',
	}))
	const app = mount(AvatarGroup, { ctrl, 'overflow-content': content })
	expect(app.root().querySelector('b')?.textContent).toBe('3')
	ctrl.overflow = 0
	flushSync()
	expect(app.root().querySelector('.so-avatar-group__overflow')).toBeNull()
})
