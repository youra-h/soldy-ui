import { it, expect } from 'vitest'
import { Avatar, AvatarGroup } from '@soxa-ui/solid'
import { TAvatar, TAvatarGroup } from '@soxa-ui/core'
import { mount } from './mount'
it('renders live external image state and scoped overflow without trimming children', () => {
	const ctrl = new TAvatar({ initials: 'AL' }),
		group = new TAvatarGroup({ overflow: 3 })
	const app = mount(() => (
		<AvatarGroup ctrl={group} overflow-content={({ count }) => <b>{count}</b>}>
			<Avatar ctrl={ctrl} aria_label="Ada" />
		</AvatarGroup>
	))
	expect(app.root().querySelectorAll('.so-avatar')).toHaveLength(1)
	expect(app.root().textContent).toBe('AL3')
	ctrl.src = 'a'
	ctrl.status = 'loaded'
	expect(app.root().querySelector('img')?.getAttribute('alt')).toBe('')
	expect(app.root().querySelector('.so-avatar__fallback')).toBeNull()
	ctrl.src = 'b'
	ctrl.initials = 'GH'
	expect(app.root().querySelector('img')).toBeNull()
	expect(app.root().textContent).toBe('GH3')
	group.overflow = 0
	expect(app.root().querySelector('.so-avatar-group__overflow')).toBeNull()
	group.overflow = 4
	expect(app.root().querySelector('b')?.textContent).toBe('4')
})
