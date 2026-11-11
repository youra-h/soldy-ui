import { it, expect, afterEach } from 'vitest'
import { TAvatarElement, TAvatarGroupElement } from '@soxa-ui/webc'
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))
afterEach(() => {
	document.body.innerHTML = ''
})
it('renders live image state and explicit count without trimming children', async () => {
	const avatar = document.createElement('span', { is: 'so-avatar' }),
		group = document.createElement('span', { is: 'so-avatar-group' })
	if (!(avatar instanceof TAvatarElement) || !(group instanceof TAvatarGroupElement))
		throw new Error('Missing registration')
	avatar.initials = 'AL'
	avatar.aria_label = 'Ada'
	group.overflow = 3
	group.append(avatar)
	document.body.append(group)
	await flush()
	expect(group.querySelector('.so-avatar-group__count')?.textContent).toBe('+3')
	const ctrl = avatar.ctrl
	if (!ctrl) throw new Error('Missing ctrl')
	ctrl.src = 'a'
	ctrl.status = 'loaded'
	await flush()
	expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('')
	ctrl.src = 'b'
	ctrl.initials = 'GH'
	group.overflow = 0
	await flush()
	expect(avatar.querySelector('img')).toBeNull()
	expect(avatar.textContent).toBe('GH')
	expect(group.querySelector('.so-avatar-group__overflow')).toBeNull()
	expect(group.contains(avatar)).toBe(true)
	group.overflow = 4
	await flush()
	expect(group.querySelector('.so-avatar-group__count')?.textContent).toBe('+4')
})
