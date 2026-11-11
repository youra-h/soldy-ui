import { it, expect } from 'vitest'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { Avatar, AvatarGroup } from '@soxa-ui/react'
import { TAvatar, TAvatarGroup } from '@soxa-ui/core'
import { mount, track } from './mount'

it('renders live external image state, fallback slots and one accessible image', () => {
	const ctrl = new TAvatar({ initials: 'AL' })
	const app = mount(<Avatar ctrl={ctrl} aria_label="Ada" />)
	expect(app.root().textContent).toBe('AL')
	expect(app.root().getAttribute('role')).toBe('img')
	act(() => {
		ctrl.src = 'a'
		ctrl.status = 'loaded'
	})
	expect(app.root().querySelector('img')?.getAttribute('alt')).toBe('')
	expect(app.root().querySelector('.so-avatar__fallback')).toBeNull()
	act(() => {
		ctrl.src = 'b'
		ctrl.initials = 'GH'
	})
	expect(app.root().querySelector('img')).toBeNull()
	expect(app.root().textContent).toBe('GH')
	app.render(<Avatar ctrl={ctrl} fallback={<b>custom</b>} />)
	expect(app.root().textContent).toBe('custom')
})
it('keeps children and replaces explicit overflow with the scoped slot', () => {
	const ctrl = new TAvatarGroup({ overflow: 3 })
	const app = mount(
		<AvatarGroup ctrl={ctrl} overflow-content={({ count }) => <b>{count}</b>}>
			<Avatar initials="AL" aria_label="Ada" />
		</AvatarGroup>,
	)
	expect(app.root().querySelectorAll('.so-avatar')).toHaveLength(1)
	expect(app.root().querySelector('b')?.textContent).toBe('3')
	expect(app.root().getAttribute('aria-hidden')).toBeNull()
	act(() => {
		ctrl.overflow = 0
	})
	expect(app.root().querySelector('.so-avatar-group__overflow')).toBeNull()
	act(() => {
		ctrl.overflow = 4
	})
	expect(app.root().querySelector('b')?.textContent).toBe('4')
})
it('hydrates the server fallback and explicit count without replacing nodes', async () => {
	const tree = (
		<Avatar.Group overflow={3}>
			<Avatar src="/avatar.png" initials="AL" aria_label="Ada" />
		</Avatar.Group>
	)
	const container = document.createElement('div')
	container.innerHTML = renderToString(tree)
	document.body.append(container)
	const nodes = [...container.querySelectorAll('*')]
	expect(container.textContent).toBe('AL+3')
	await act(async () => {
		track(hydrateRoot(container, tree))
	})
	expect([...container.querySelectorAll('*')].every((node, i) => node === nodes[i])).toBe(true)
})
