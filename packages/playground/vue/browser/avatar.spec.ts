import { afterEach, describe, it, expect } from 'vitest'
import axe from 'axe-core'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import { forcedColors } from './media'
import { contrast, gradientColor, hue, iconPaint, opacity, pixel, systemColor } from './colors'
import '@soxa-ui/theme-oren'

let handle: IPreviewHandle | undefined, container: HTMLElement | undefined
const IMAGE =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="teal"/></svg>',
	)
const VARIANTS = ['accent', 'positive', 'negative', 'caution'] as const
const SCHEMES = ['oren', 'oren-dark'] as const
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

function appearance() {
	const { color, backgroundColor, backgroundImage } = getComputedStyle(root())
	return { color, backgroundColor, backgroundImage }
}

function token(name: string) {
	const probe = document.createElement('span')
	probe.style.color = `var(${name})`
	document.body.append(probe)
	const color = getComputedStyle(probe).color
	probe.remove()
	return color
}

// Classify by family rather than a tight hue tolerance: translucent canvas samples are quantized.
function familyOf(color: string) {
	const angle = hue([color]).angle
	return VARIANTS.map((variant) => {
		const delta = Math.abs(angle - hue([token(`--so-${variant}-500`)]).angle)
		return { variant, distance: Math.min(delta, 360 - delta) }
	}).sort((a, b) => a.distance - b.distance)[0].variant
}

describe.each(FRAMEWORKS)('Avatar runtime · $id', ({ id }) => {
	it.each(SCHEMES)('colors fallback variants and restores neutral in %s', async (scheme) => {
		document.documentElement.setAttribute('data-so-theme', scheme)
		const props = { initials: 'AL', aria_label: 'Ada' }
		await show(id, 'avatar', props)
		const neutral = appearance()
		const backgrounds = new Set([neutral.backgroundImage])
		const texts = new Set([neutral.color])
		for (const variant of VARIANTS) {
			handle?.update({ ...props, variant })
			await expect
				.poll(() => root().classList.contains(`so-avatar--variant-${variant}`))
				.toBe(true)
			const look = appearance()
			const layer = gradientColor(root())
			expect(opacity(look.backgroundColor)).toBe(1)
			expect(opacity(layer)).toBeGreaterThan(0)
			expect(opacity(layer)).toBeLessThan(1)
			expect(look.backgroundColor).toBe(neutral.backgroundColor)
			expect(familyOf(layer)).toBe(variant)
			expect(contrast(look.color, [look.backgroundColor, layer])).toBeGreaterThanOrEqual(4.5)
			expect(familyOf(look.color)).toBe(variant)
			expect(root().textContent?.trim()).toBe('AL')
			backgrounds.add(look.backgroundImage)
			texts.add(look.color)
		}
		expect(backgrounds.size).toBe(5)
		expect(texts.size).toBe(5)
		handle?.update({ ...props, variant: 'normal' })
		await expect.poll(appearance).toEqual(neutral)
		handle?.update({ ...props, variant: 'accent' })
		await expect.poll(() => appearance().color).not.toBe(neutral.color)
		handle?.update({ ...props, variant: undefined })
		await expect.poll(appearance).toEqual(neutral)
	})

	it('keeps a chromatic fallback readable with theme forced-color rules', async () => {
		await show(id, 'avatar', { initials: 'AL', variant: 'accent' })
		await forcedColors('active')
		const look = appearance()
		expect(look.backgroundImage).toBe('none')
		expect(look.backgroundColor).toBe(systemColor('Canvas'))
		expect(look.color).toBe(systemColor('CanvasText'))
	})

	it.each(SCHEMES)(
		'colors the real Icon fallback without duplicate accessible names in %s',
		async (scheme) => {
			document.documentElement.setAttribute('data-so-theme', scheme)
			await show(
				id,
				'avatar',
				{ initials: 'AL', aria_label: 'Ada', variant: 'positive' },
				'avatar-fallback',
			)
			const icon = root().querySelector('.so-icon')
			if (!icon) throw new Error('Missing fallback Icon')
			expect([...pixel([iconPaint(icon)])]).toEqual([...pixel([appearance().color])])
			expect(
				root().querySelector(
					'.so-avatar__fallback .so-icon svg,.so-avatar__fallback svg.so-icon',
				),
			).not.toBeNull()
			expect(root().textContent?.includes('AL')).toBe(false)
			const audit = await axe.run(root())
			expect(audit.violations).toEqual([])
		},
	)
	it.each(SCHEMES)(
		'preserves the image and geometry through variant and loading changes in %s',
		async (scheme) => {
			document.documentElement.setAttribute('data-so-theme', scheme)
			const props = { initials: 'AL', aria_label: 'Ada', size: 'lg' }
			await show(id, 'avatar', { ...props, src: IMAGE, variant: 'accent' })
			await expect.poll(() => root().dataset.status).toBe('loaded')
			const box = root().getBoundingClientRect()
			expect(box.width).toBe(40)
			expect(box.height).toBe(40)
			const image = root().querySelector('img')
			expect(image?.alt).toBe('')
			expect(image?.naturalWidth).toBe(32)
			if (!image) throw new Error('Missing loaded image')
			const imageLook = getComputedStyle(image)
			const originalPaint = [
				imageLook.filter,
				imageLook.opacity,
				imageLook.mixBlendMode,
				imageLook.objectFit,
			]
			expect(originalPaint).toEqual(['none', '1', 'normal', 'cover'])
			const accentText = appearance().color
			handle?.update({ ...props, src: IMAGE, variant: 'negative' })
			await expect.poll(() => appearance().color).not.toBe(accentText)
			const negativeText = appearance().color
			const updatedImage = root().querySelector('img')
			if (!updatedImage) throw new Error('Missing image after variant change')
			const updatedPaint = getComputedStyle(updatedImage)
			expect([
				updatedPaint.filter,
				updatedPaint.opacity,
				updatedPaint.mixBlendMode,
				updatedPaint.objectFit,
			]).toEqual(originalPaint)
			expect(updatedImage.src).toBe(image.src)
			expect(updatedImage.naturalWidth).toBe(32)
			expect(root().getBoundingClientRect().width).toBe(box.width)
			expect(root().querySelector('.so-avatar__fallback')).toBeNull()
			handle?.update({
				variant: 'negative',
				src: 'data:image/png;base64,broken',
				initials: 'AL',
				aria_label: 'Ada',
				size: 'lg',
			})
			await expect.poll(() => root().dataset.status).toBe('error')
			expect(appearance().color).toBe(negativeText)
			expect(root().querySelector('img')).toBeNull()
			expect(root().textContent?.trim()).toBe('AL')
			expect(root().getBoundingClientRect().width).toBe(box.width)
			handle?.update({ ...props, src: IMAGE, variant: 'positive' })
			await expect.poll(() => root().dataset.status).toBe('loaded')
			const audit = await axe.run(root())
			expect(audit.violations).toEqual([])
			handle?.update({
				src: '',
				initials: 'GH',
				aria_label: 'Grace',
				size: 'lg',
				variant: 'caution',
			})
			await expect.poll(() => root().dataset.status).toBe('idle')
			expect(root().querySelector('img')).toBeNull()
			expect(root().textContent?.trim()).toBe('GH')
			expect(familyOf(appearance().color)).toBe('caution')
		},
	)
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
