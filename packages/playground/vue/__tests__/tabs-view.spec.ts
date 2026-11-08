/**
 * Active-tab geometry is independent of the theme's view names.
 * TTabsViewPlugin from theme-base/setup is installed by useTheme(oren) in the
 * test setup. It always writes active-position/size and line-gap variables
 * on the bar, then exposes data-ready-animation after mounting. The theme
 * chooses which geometry its view uses, including the default view.
 *
 * jsdom checks variable presence because it cannot measure layout. Browser
 * tabs-layout tests check positions; tabs-line and tabs-contained check motion.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { TTabs } from '@soxa-ui/core'
import { TPluginBundle, TTabsActiveTabPlugin } from '@soxa-ui/plugins'
import { Tabs, TabsItem } from '@soxa-ui/vue'

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

let wrapper: ReturnType<typeof mount> | null = null

afterEach(() => {
	wrapper?.unmount()
	wrapper = null
	document.body.innerHTML = ''
})

/** Табы из слота — строковым шаблоном, плоскими именами. */
const render = async (attrs: string, setup: () => Record<string, unknown> = () => ({})) => {
	wrapper = mount(
		{
			components: { Tabs, TabsItem },
			setup,
			template: `
				<Tabs ${attrs}>
					<TabsItem value="a" text="Первый" active />
					<TabsItem value="b" text="Второй" />
				</Tabs>
			`,
		},
		{ attachTo: document.body },
	)

	await nextFrame()
	await nextFrame()
}

/** Ряд набора — список табов и слоты по его краям: на нём переменные геометрии. */
const bar = (): HTMLElement => {
	const found = document.querySelector('.so-tabs > .so-tabs__bar')

	if (!(found instanceof HTMLElement)) throw new Error('ряда табов нет')

	return found
}

/** Список табов — ребёнок ряда: место таба меряется от ряда, а не от него. */
const list = (): HTMLElement => {
	const found = bar().querySelector(':scope > .so-tabs__list')

	if (!(found instanceof HTMLElement)) throw new Error('списка табов нет')

	return found
}

/** Строка таба по порядку; клик по ней активирует таб. */
const row = (index: number): HTMLElement => {
	const found = document.querySelectorAll('[role="tab"]')[index]

	if (!(found instanceof HTMLElement)) throw new Error(`таба ${index} нет`)

	return found
}

describe('геометрия активного таба без знания о виде', () => {
	it('readiness is absent before mounting and removed on unmount', async () => {
		const tabs = new TTabs()

		expect(tabs.dataset.toObject()['data-ready-animation']).toBeUndefined()

		await render(':ctrl="tabs"', () => ({ tabs }))

		expect(tabs.dataset.toObject()['data-ready-animation']).toBe('true')
		expect(tabs.classes.toArray()).not.toContain('so-tabs--ready-animation')

		wrapper?.unmount()
		wrapper = null

		expect(tabs.dataset.toObject()['data-ready-animation']).toBeUndefined()
	})

	it.each([
		['без view', ''],
		['с view темы', 'view="cards"'],
	])('%s: переменные места и разрыва записаны, анимация включена', async (_, attrs) => {
		await render(attrs)

		const style = bar().style

		expect(style.getPropertyValue('--so-tabs-active-pos')).not.toBe('')
		expect(style.getPropertyValue('--so-tabs-active-size')).not.toBe('')
		expect(style.getPropertyValue('--so-tabs-gap-pos')).not.toBe('')
		expect(style.getPropertyValue('--so-tabs-gap-size')).not.toBe('')
		expect(list().style.getPropertyValue('--so-tabs-active-pos'), 'не на списке').toBe('')
		expect(document.querySelector('.so-tabs')?.getAttribute('data-ready-animation')).toBe(
			'true',
		)
	})
})

/**
 * Признак переезда (`--so-tabs-active-moving`) — по каждой записи геометрии: тест
 * слушает тот же `change:active-tab`, что и плагин раскладки, и подписан позже
 * него (`bundle:create` приходит после сборки набора), поэтому застаёт ряд
 * сразу после записи. Переходов в jsdom нет, и признак снимается кадром позже.
 */
describe('признак переезда', () => {
	it('ставит смена активного таба, а не первая запись и не смена вида; снимается кадром позже', async () => {
		const tabs = new TTabs()
		const writes: string[] = []

		tabs.events.on('bundle:create', (bundle: unknown) => {
			if (!(bundle instanceof TPluginBundle)) return

			bundle
				.get(TTabsActiveTabPlugin)
				?.events.on('change:active-tab', ({ newValue: offset }) => {
					if (offset)
						writes.push(offset.barEl.style.getPropertyValue('--so-tabs-active-moving'))
				})
		})

		await render(':ctrl="tabs"', () => ({ tabs }))

		// Первая запись — на монтировании, без признака
		expect(writes).toEqual([''])

		row(1).click()

		expect(writes).toEqual(['', '1'])
		expect(bar().style.getPropertyValue('--so-tabs-active-moving')).toBe('1')

		await nextFrame()

		expect(bar().style.getPropertyValue('--so-tabs-active-moving')).toBe('')

		// Тот же таб, другой вид — пересчёт без признака
		tabs.view = 'outline'

		expect(writes).toEqual(['', '1', ''])
	})
})
