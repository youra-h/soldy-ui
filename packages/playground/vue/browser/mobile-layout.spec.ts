import { afterEach, describe, expect, it } from 'vitest'
import { page, server } from 'vitest/browser'
import { COMPONENTS } from '@soxa-ui/playground-shared'
import { MOBILE_COMPONENTS, mountMobile, find } from './mobile'
import { cleanup } from './render'

afterEach(() => {
	cleanup()
	document.documentElement.removeAttribute('dir')
	document.documentElement.removeAttribute('data-so-theme')
})

describe('mobile device and component inventory', () => {
	it('runs a narrow touch device rather than a desktop viewport', () => {
		expect(innerWidth).toBe(390)
		// Linux WebKit exposes touch events but reports zero maxTouchPoints.
		expect(navigator.maxTouchPoints).toBe(server.browser === 'webkit' ? 0 : 1)
		expect('ontouchstart' in window).toBe(true)
		expect(matchMedia('(pointer: coarse)').matches).toBe(true)
		expect(matchMedia('(hover: none)').matches).toBe(true)
	})
	it('covers every current registry id explicitly', () => {
		expect([...MOBILE_COMPONENTS].sort()).toEqual(COMPONENTS.map((entry) => entry.id).sort())
	})
})

for (const [width, direction, theme] of [
	[360, 'ltr', 'light'],
	[390, 'rtl', 'dark'],
	[414, 'ltr', 'light'],
] as const) {
	describe(width + 'px ' + direction + ' ' + theme, () => {
		it.each(MOBILE_COMPONENTS)(
			'%s fits the phone and renders meaningful content',
			async (id) => {
				await page.viewport(width, 844)
				document.documentElement.dir = direction
				document.documentElement.dataset.soTheme = theme === 'dark' ? 'oren-dark' : 'oren'
				await mountMobile(id)
				const scene = find('#mobile-scene')
				expect(scene.children.length).toBeGreaterThan(0)
				expect(scene.getBoundingClientRect().width).toBeLessThanOrEqual(width)
				await expect
					.poll(() => document.documentElement.scrollWidth, {
						message: id + ': unintended page overflow',
					})
					.toBeLessThanOrEqual(width + 1)
				const content = [...scene.querySelectorAll('[class*="so-"]')].filter((node) => {
					const box = node.getBoundingClientRect()
					return box.width > 0 && box.height > 0
				})
				expect(content.length, id + ': visible library parts').toBeGreaterThan(0)
			},
		)
	})
}
