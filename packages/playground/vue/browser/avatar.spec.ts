import { afterEach, describe, it, expect } from 'vitest'
import axe from 'axe-core'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import { forcedColors } from './media'
import '@soxa-ui/theme-oren'

let handle: IPreviewHandle | undefined, container: HTMLElement | undefined
const IMAGE =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="teal"/></svg>',
	)
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
afterEach(async () => {
	handle?.unmount()
	handle = undefined
	container?.remove()
	container = undefined
	document.documentElement.removeAttribute('data-so-theme')
	await forcedColors('none')
})
async function show(
	framework: string,
	component: string,
	props: Record<string, unknown>,
	fixture?: string,
) {
	const host = await loadHost(framework)
	container = document.createElement('div')
	container.style.cssText = 'padding:40px;display:inline-block'
	document.body.append(container)
	handle = host.mount(container, { component, props, fixture })
	await frame()
	await frame()
}
function root() {
	const node = container?.querySelector('.so-avatar,.so-avatar-group')
	if (!(node instanceof HTMLElement)) throw new Error('Missing Avatar root')
	return node
}

describe.each(FRAMEWORKS)('Avatar runtime · $id', ({ id }) => {
	it('uses the real Icon fallback slot without duplicate accessible names', async () => {
		await show(id, 'avatar', { initials: 'AL', aria_label: 'Ada' }, 'avatar-fallback')
		expect(
			root().querySelector(
				'.so-avatar__fallback .so-icon svg,.so-avatar__fallback svg.so-icon',
			),
		).not.toBeNull()
		expect(root().textContent?.includes('AL')).toBe(false)
		const audit = await axe.run(root())
		expect(audit.violations).toEqual([])
	})
	it('loads a real image, recovers after failure and keeps fixed geometry', async () => {
		await show(id, 'avatar', { src: IMAGE, initials: 'AL', aria_label: 'Ada', size: 'lg' })
		await expect.poll(() => root().dataset.status).toBe('loaded')
		const box = root().getBoundingClientRect()
		expect(box.width).toBe(40)
		expect(box.height).toBe(40)
		const image = root().querySelector('img')
		expect(image?.alt).toBe('')
		expect(image?.naturalWidth).toBe(32)
		expect(root().querySelector('.so-avatar__fallback')).toBeNull()
		handle?.update({
			src: 'data:image/png;base64,broken',
			initials: 'AL',
			aria_label: 'Ada',
			size: 'lg',
		})
		await expect.poll(() => root().dataset.status).toBe('error')
		expect(root().querySelector('img')).toBeNull()
		expect(root().textContent?.trim()).toBe('AL')
		expect(root().getBoundingClientRect().width).toBe(box.width)
		handle?.update({ src: IMAGE, initials: 'AL', aria_label: 'Ada', size: 'lg' })
		await expect.poll(() => root().dataset.status).toBe('loaded')
		const audit = await axe.run(root())
		expect(audit.violations).toEqual([])
		handle?.update({ src: '', initials: 'GH', aria_label: 'Grace', size: 'lg' })
		await expect.poll(() => root().dataset.status).toBe('idle')
		expect(root().querySelector('img')).toBeNull()
		expect(root().textContent?.trim()).toBe('GH')
	})
	it.each(['ltr', 'rtl'])(
		'overlaps every explicit child and count in %s in both schemes',
		async (direction) => {
			await show(id, 'avatar-group', { overflow: 3, direction })
			const colors: string[] = []
			for (const scheme of ['oren', 'oren-dark']) {
				document.documentElement.setAttribute('data-so-theme', scheme)
				const avatars = [...root().querySelectorAll<HTMLElement>('.so-avatar')]
				expect(avatars).toHaveLength(3)
				const first = avatars[0].getBoundingClientRect(),
					second = avatars[1].getBoundingClientRect()
				expect(Math.abs(Math.abs(second.x - first.x) - 28)).toBeLessThan(0.5)
				const count = root().querySelector<HTMLElement>('.so-avatar-group__count')
				expect(count?.textContent).toBe('+3')
				if (count) colors.push(getComputedStyle(count).backgroundColor)
				expect(count && getComputedStyle(count).direction).toBe('ltr')
				const audit = await axe.run(root())
				expect(audit.violations).toEqual([])
			}
			expect(colors[0]).not.toBe(colors[1])
			handle?.update({ overflow: 0, direction })
			await frame()
			expect(root().querySelector('.so-avatar-group__overflow')).toBeNull()
			expect(root().querySelectorAll('.so-avatar')).toHaveLength(3)
		},
	)
	it('keeps the count readable with theme forced-color rules', async () => {
		await show(id, 'avatar-group', { overflow: 3 })
		await forcedColors('active')
		const count = root().querySelector<HTMLElement>('.so-avatar-group__count')
		expect(count).not.toBeNull()
		if (!count) throw new Error('Missing overflow count')
		expect(getComputedStyle(count).color).not.toBe(getComputedStyle(count).backgroundColor)
		expect(count.getBoundingClientRect().height).toBe(32)
	})
})
