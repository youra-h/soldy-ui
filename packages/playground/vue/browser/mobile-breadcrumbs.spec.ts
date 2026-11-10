import { afterEach, describe, expect, it } from 'vitest'
import { commands } from 'vitest/browser'
import { defineComponent, h, nextTick } from 'vue'
import { Breadcrumbs } from '@soxa-ui/vue'
import { cleanup, render } from './render'
import { find, frame } from './mobile'
import '@soxa-ui/theme-oren'

afterEach(() => {
	cleanup()
	document.documentElement.removeAttribute('dir')
	document.documentElement.removeAttribute('data-so-theme')
})

describe('Breadcrumbs on a touch device', () => {
	it.each(['ltr', 'rtl'] as const)(
		'%s keeps a long trail usable and honors cancelled link taps',
		async (direction) => {
			document.documentElement.dir = direction
			document.documentElement.dataset.soTheme = direction === 'rtl' ? 'oren-dark' : 'oren'
			const items = [
				{ text: 'Home', href: '#home' },
				{ text: 'Catalog', href: '#catalog' },
				{ text: 'Group' },
				{ text: 'Phones', href: '#phones' },
				{ text: 'Smartphones', href: '#smartphones' },
				{ text: 'very-long-product-name-'.repeat(8), _: { active: true } },
			]

			render(
				defineComponent({
					render: () =>
						h('main', { style: 'padding:16px;box-sizing:border-box' }, [
							h(Breadcrumbs, { items, maxItems: 3 }),
							h('button', { class: 'outside', style: 'margin-top:30px' }, 'Outside'),
						]),
				}),
			)
			await nextTick()
			await frame()
			expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth)
			expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
			await commands.tap('.so-breadcrumbs__trigger')
			await expect
				.poll(() => find('.so-breadcrumbs__trigger').getAttribute('aria-expanded'))
				.toBe('true')
			const link = find('a[role="menuitem"][href="#catalog"]')
			const before = location.href
			let clicks = 0
			let pointerType: string | undefined

			link.addEventListener('pointerdown', (event) => {
				pointerType = event.pointerType
			})
			link.addEventListener('click', (event) => {
				clicks++
				event.preventDefault()
			})
			await commands.tap('a[role="menuitem"][href="#catalog"]')
			expect(pointerType).toBe('touch')
			expect(clicks).toBe(1)
			expect(location.href).toBe(before)
			expect(find('.so-breadcrumbs__trigger').getAttribute('aria-expanded')).toBe('false')
			await commands.tap('.so-breadcrumbs__trigger')
			await expect
				.poll(() => find('.so-breadcrumbs__trigger').getAttribute('aria-expanded'))
				.toBe('true')
			await commands.tap('.outside')
			await expect
				.poll(() => find('.so-breadcrumbs__trigger').getAttribute('aria-expanded'))
				.toBe('false')
		},
	)
})
