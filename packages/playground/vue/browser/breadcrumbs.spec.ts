import { afterEach, describe, it, expect } from 'vitest'
import { userEvent, commands } from 'vitest/browser'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Breadcrumbs, LocaleProvider } from '@soxa-ui/vue'
import { enUS, ruRU } from '@soxa-ui/plugins'
import type { BreadcrumbsDescriptor, DescriptorSlots } from '@soxa-ui/setup'
import type { TBreadcrumbsItem } from '@soxa-ui/core'
import { render, cleanup } from './render'
import { find } from './colors'
import '@soxa-ui/theme-oren'
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const items: readonly TBreadcrumbsItem[] = [
	{ text: 'Home', href: 'about:blank#home', target: '_blank', rel: 'noopener' },
	{ text: 'Catalog', href: 'about:blank#catalog', target: '_blank', rel: 'noopener' },
	{ text: 'Group' },
	{ text: 'Phones', href: 'about:blank#phones', target: '_blank', rel: 'noopener' },
	{ text: 'Current' },
]
afterEach(() => {
	cleanup()
	document.documentElement.removeAttribute('dir')
	document.documentElement.removeAttribute('data-so-theme')
})
async function show(props: object = {}) {
	render(
		defineComponent({
			render: () =>
				h(
					'div',
					{ style: 'padding:24px;max-width:380px' },
					h(Breadcrumbs, { items, maxItems: 3, ...props }),
				),
		}),
	)
	await nextTick()
	await frame()
}
const trigger = () => find('.so-breadcrumbs__trigger')
async function open() {
	await userEvent.click(trigger())
	await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('true')
}
describe('Breadcrumbs native navigation', () => {
	it.each(['oren', 'oren-dark'])(
		'%s: visible positions, decorative separators and current state',
		async (scheme) => {
			document.documentElement.dataset.soTheme = scheme
			await show()
			expect(document.querySelectorAll('.so-breadcrumbs__list > li')).toHaveLength(3)
			expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
			for (const node of document.querySelectorAll('.so-breadcrumbs__separator')) {
				expect(node.getAttribute('aria-hidden')).toBe('true')
				expect(getComputedStyle(node, '::before').content).toBe('"/"')
			}
			const root = find('.so-breadcrumbs').getBoundingClientRect()
			expect(root.width).toBeLessThanOrEqual(380)
		},
	)
	it('opens with keyboard, typeaheads, moves Home/End and closes with Escape and Tab', async () => {
		await show()
		trigger().focus()
		await userEvent.keyboard('{ArrowDown}')
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Catalog')
		await userEvent.keyboard('{End}')
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Phones')
		await userEvent.keyboard('{Home}p')
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Phones')
		await userEvent.keyboard('{Escape}')
		await expect.poll(() => document.activeElement).toBe(trigger())
		trigger().focus()
		await userEvent.keyboard(' ')
		await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('true')
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
		await expect.poll(() => trigger().getAttribute('aria-expanded')).toBe('false')
	})
	for (const action of ['primary', 'middle', 'modified', 'enter'] as const) {
		it('keeps native ' + action + ' activation on visible and hidden links', async () => {
			await show()
			const visible = await commands.activateNativeLink('.so-breadcrumbs__link[href]', action)
			expect(visible).toContain('#home')
			await open()
			const hidden = await commands.activateNativeLink(
				'a[role="menuitem"][href="about:blank#catalog"]',
				action,
			)
			expect(hidden).toContain('#catalog')
		})
	}
	it('honors preventDefault from slot content and keeps the native link shell', async () => {
		render(
			defineComponent({
				render: () =>
					h(
						Breadcrumbs,
						{ items, maxItems: 3 },
						{
							item: ({
								item,
								index,
							}: DescriptorSlots<typeof BreadcrumbsDescriptor>['item']) =>
								h(
									'b',
									{
										class: 'cancel-' + index,
										onClick: (event: MouseEvent) => event.preventDefault(),
									},
									item.text,
								),
						},
					),
			}),
		)
		await nextTick()
		await frame()
		await open()
		const before = location.href
		let canceled = false
		const content = find('a[role="menuitem"] .cancel-1')
		content.addEventListener('click', (event) => {
			queueMicrotask(() => (canceled = event.defaultPrevented))
		})
		const opened = await commands.activateNativeLink('a[role="menuitem"] .cancel-1', 'cancel')
		expect(opened).toBe('no-page')
		expect(canceled).toBe(true)
		expect(location.href).toBe(before)
		expect(find('a[role="menuitem"]').querySelector('a,button')).toBeNull()
	})
	it('repairs dynamic focus and closes overflow while preserving locale and RTL updates', async () => {
		const trail = ref(items),
			max = ref(3),
			locale = ref(enUS)
		render(
			defineComponent({
				render: () =>
					h(LocaleProvider, { locale: locale.value }, () =>
						h(Breadcrumbs, { items: trail.value, maxItems: max.value }),
					),
			}),
		)
		await nextTick()
		await frame()
		await open()
		find('a[role="menuitem"][href="about:blank#catalog"]').focus()
		max.value = 0
		await nextTick()
		await frame()
		await expect
			.poll(() => document.activeElement?.getAttribute('href'))
			.toBe('about:blank#catalog')
		locale.value = ruRU
		document.documentElement.dir = 'rtl'
		await nextTick()
		expect(find('.so-breadcrumbs').getAttribute('aria-label')).toBe('Навигационная цепочка')
		expect(getComputedStyle(find('.so-breadcrumbs')).direction).toBe('rtl')
		trail.value = [{ text: 'No links' }]
		await nextTick()
		await frame()
		expect(document.activeElement).toBe(find('.so-breadcrumbs'))
	})
})
