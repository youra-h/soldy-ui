import { afterEach, describe, it, expect } from 'vitest'
import { TSeparator } from '@soxa-ui/core'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import { forcedColors } from './media'
import '@soxa-ui/theme-oren'

let handle: IPreviewHandle | undefined
let container: HTMLElement | undefined
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

async function show(framework: string, props: Record<string, unknown>) {
	const host = await loadHost(framework)
	container = document.createElement('div')
	container.style.cssText = 'width:240px;max-width:100%'
	document.body.append(container)
	handle = host.mount(container, { component: 'separator', props })
	await frame()
	await frame()
}

function root(): HTMLElement {
	const node = container?.querySelector('.so-separator')
	if (!(node instanceof HTMLElement)) throw new Error('Separator is missing')
	return node
}

afterEach(async () => {
	handle?.unmount()
	handle = undefined
	container?.remove()
	container = undefined
	document.documentElement.removeAttribute('data-so-theme')
	await forcedColors('none')
})

describe.each(FRAMEWORKS)('Separator · $id', ({ id }) => {
	it('draws each axis in either semantic mode on a narrow RTL or LTR parent', async () => {
		await show(id, {})

		for (const scheme of ['oren', 'oren-dark']) {
			document.documentElement.setAttribute('data-so-theme', scheme)
			for (const direction of ['ltr', 'rtl'])
				for (const orientation of ['horizontal', 'vertical'])
					for (const decorative of [false, true]) {
						await handle?.update({ direction, orientation, decorative })
						await expect
							.poll(() => root().getAttribute('role'))
							.toBe(decorative ? 'none' : 'separator')
						expect(root().getAttribute('aria-orientation')).toBe(
							decorative ? null : orientation,
						)

						const box = root().getBoundingClientRect()
						expect(box.width).toBeGreaterThan(0)
						expect(box.height).toBeGreaterThan(0)
						expect(
							orientation === 'horizontal' ? box.width : box.height,
						).toBeGreaterThan(100)
						expect(
							orientation === 'horizontal' ? box.height : box.width,
						).toBeLessThanOrEqual(2)
						expect(root().getAttribute('dir')).toBe(direction)
						expect(root().children.length).toBe(0)
						expect(root().textContent).toBe('')
						expect(root().tabIndex).toBe(-1)
						root().focus()
						expect(document.activeElement).not.toBe(root())
					}
		}
	})

	it('restores semantics after ctrl changes and resets removed props', async () => {
		const ctrl = new TSeparator()
		await show(id, { ctrl })
		ctrl.decorative = true
		ctrl.orientation = 'vertical'
		ctrl.decorative = false
		await expect.poll(() => root().getAttribute('aria-orientation')).toBe('vertical')

		handle?.unmount()
		container?.remove()
		await show(id, { orientation: 'vertical', decorative: true })
		await expect.poll(() => root().getAttribute('role')).toBe('none')
		await handle?.update({})
		await expect.poll(() => root().getAttribute('role')).toBe('separator')
		expect(root().getAttribute('aria-orientation')).toBe('horizontal')

		await handle?.update({ visible: false })
		await expect.poll(() => getComputedStyle(root()).display).toBe('none')
		await handle?.update({ rendered: false })
		// Attribute-based hosts retain their native host while rendered=false hides it.
		await expect
			.poll(() => {
				const node = container?.querySelector('.so-separator')
				return (
					!node ||
					(node instanceof HTMLElement && getComputedStyle(node).display === 'none')
				)
			})
			.toBe(true)
	})

	it('keeps a visible border in forced colors', async () => {
		await forcedColors('active')
		await show(id, { orientation: 'vertical' })

		const style = getComputedStyle(root())
		expect(style.borderInlineStartStyle).toBe('solid')
		expect(parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(0)
		expect(root().getBoundingClientRect().height).toBeGreaterThan(0)
	})
})
