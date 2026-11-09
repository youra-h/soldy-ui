import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { commands } from 'vitest/browser'
import { h, defineComponent, ref } from 'vue'
import { Slider, Drawer, ListBox, DragAndDrop } from '@soxa-ui/vue'
import { TSlider } from '@soxa-ui/core'
import { continuousTouch } from './engine'
import { settled } from './transitions'
import { mountMobile, find, frame } from './mobile'
import { cleanup, render } from './render'

beforeEach(() => {
	document.documentElement.dataset.soTheme = 'oren'
})
afterEach(cleanup)

/** WebKit's public touchscreen API has no continuous gesture operation. */
describe.runIf(continuousTouch)('native continuous mobile gestures (CDP)', () => {
	it('Slider changes under the finger without scrolling the page sideways', async () => {
		const ctrl = new TSlider({ value: 20 })
		render(
			defineComponent({
				render: () => h('div', { style: 'padding:40px 24px' }, [h(Slider, { ctrl })]),
			}),
		)
		await frame()
		await frame()
		await commands.touchDrag('.so-slider__thumb', 100, 0)
		expect(ctrl.value).toBeGreaterThan(20)
		expect(scrollX).toBe(0)
	})
	it.each(['scroller', 'tags', 'tabs'])(
		'%s scrolls its own long row with a native finger',
		async (id) => {
			await mountMobile(
				id,
				id === 'tags'
					? {
							overflow: 'scroll',
							items: Array.from({ length: 10 }, (_, i) => ({
								value: i,
								text: 'Long mobile tag ' + i,
							})),
						}
					: {},
			)
			const selector =
				id === 'scroller'
					? '.so-scroller__viewport'
					: id === 'tags'
						? '.so-tags'
						: '.so-tabs__bar'
			const node = find(selector)
			expect(node.scrollWidth).toBeGreaterThan(node.clientWidth)
			const before = node.scrollLeft
			await commands.touchDrag(selector, -150, 0)
			await expect.poll(() => node.scrollLeft).toBeGreaterThan(before)
			expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth)
		},
	)
	it('Drawer closes toward its edge', async () => {
		const visible = ref(true)
		render(
			defineComponent({
				render: () =>
					h(
						Drawer,
						{
							visible: visible.value,
							placement: 'bottom',
							height: 320,
							swipe: 'handle',
							'onUpdate:visible': (value: boolean) => (visible.value = value),
						},
						{ title: () => 'Mobile drawer', default: () => h('p', 'Drawer content') },
					),
			}),
		)
		await frame()
		await frame()
		await expect
			.poll(() => find('.so-drawer').getBoundingClientRect().bottom)
			.toBeLessThanOrEqual(innerHeight + 1)
		await commands.touchDrag('.so-drawer__handle', 0, 180)
		await expect.poll(() => visible.value).toBe(false)
	})
	it('Virtual list scrolls to content beyond its initial rendered window', async () => {
		await mountMobile('virtual')
		const list = find('.so-list-box__list')
		const before = list.textContent
		await commands.touchDrag('.so-list-box-item:nth-child(4)', 0, -160)
		await expect.poll(() => list.scrollTop).toBeGreaterThan(0)
		await expect.poll(() => list.textContent).not.toBe(before)
	})
	it('long press moves a list item while a short gesture leaves the order unchanged', async () => {
		const items = [
			{ value: 'a', text: 'First mobile item' },
			{ value: 'b', text: 'Second mobile item' },
			{ value: 'c', text: 'Third mobile item' },
		]
		render(
			defineComponent({
				render: () =>
					h(DragAndDrop, null, () =>
						h(ListBox, { items, aria_label: 'Reorder mobile items' }),
					),
			}),
		)
		await frame()
		await frame()
		const from = find('.so-list-box-item:first-child')
		const to = find('.so-list-box-item:nth-child(3)')
		const dy = to.getBoundingClientRect().top - from.getBoundingClientRect().top
		await commands.touchDrag('.so-list-box-item:first-child', 0, dy)
		expect(
			[...document.querySelectorAll('.so-list-box-item')].map((n) => n.textContent?.trim()),
		).toEqual(items.map((i) => i.text))
		await commands.touchDrag('.so-list-box-item:first-child', 0, dy, 10, 700)
		await expect
			.poll(() =>
				[...document.querySelectorAll('.so-list-box-item')].map((n) =>
					n.textContent?.trim(),
				),
			)
			.toEqual([items[1].text, items[2].text, items[0].text])
	})
})

it.runIf(continuousTouch)('Drawer body scrolls under the finger without closing', async () => {
	const visible = ref(true)
	render(
		defineComponent({
			render: () =>
				h(
					Drawer,
					{
						visible: visible.value,
						placement: 'end',
						swipe: 'panel',
						'onUpdate:visible': (value: boolean) => (visible.value = value),
					},
					{
						title: () => 'Scrollable drawer',
						default: () => [
							h('div', { style: 'height:250px' }),
							h('p', { id: 'scroll-anchor' }, 'Mobile content'),
							h('div', { style: 'height:2000px' }),
						],
					},
				),
		}),
	)
	await frame()
	await frame()
	await settled(find('.so-drawer'))
	await commands.touchDrag('#scroll-anchor', 0, -180)
	await expect.poll(() => find('.so-drawer__body').scrollTop).toBeGreaterThan(0)
	expect(visible.value).toBe(true)
})

it.runIf(continuousTouch)(
	'Table column responds to native touch without losing capture',
	async () => {
		await mountMobile('table')
		await expect.poll(() => find('.so-table').getAttribute('data-sized')).toBe('true')
		const before = [...document.querySelectorAll('.so-table-column')].map(
			(node) => node.textContent,
		)
		const headers = [...document.querySelectorAll('.so-table-column')]
		const first = headers[0].getBoundingClientRect(),
			second = headers[1].getBoundingClientRect()
		await commands.touchDrag(
			'.so-table-column:first-child',
			second.x + second.width / 2 - first.x - first.width / 2 + 10,
			0,
			10,
			700,
		)
		await expect
			.poll(() =>
				[...document.querySelectorAll('.so-table-column')].map((node) => node.textContent),
			)
			.not.toEqual(before)
	},
)
