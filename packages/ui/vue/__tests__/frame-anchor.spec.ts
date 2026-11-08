import { TPluginBundle } from '@soxa-ui/plugins'
/**
 * `anchor_anchor` у Frame, который объявлен разметкой.
 *
 * Снятый из разметки якорь обязан отвязать панель. У плагина якоря объявлено
 * умолчание `null` — «ни к чему не привязана», — и связка возвращает к нему
 * снятый проп. Без объявленного умолчания панель оставалась привязанной к
 * прежнему элементу и продолжала следить за его размером и скроллом.
 *
 * Во Vue снятый проп приходит не `undefined`, а объявленным умолчанием `null`.
 * Связка читает `null` как «не задан» (`read`) и сбрасывает проп к умолчанию —
 * здесь проверяется этот путь целиком, от разметки Vue до плагина.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import { Frame } from '@soxa-ui/vue'
import { TAnchorPlugin } from '@soxa-ui/plugins'

afterEach(() => {
	document.body.innerHTML = ''
})

describe('anchor_anchor', () => {
	it('снятый из разметки якорь отвязывает панель', async () => {
		const element = document.createElement('button')
		const bound = ref(true)
		const created: { anchor?: TAnchorPlugin } = {}

		document.body.appendChild(element)

		const wrapper = mount(
			{
				render: () =>
					h(Frame, {
						'onBundle:create': (bundle: unknown) => {
							const plugin =
								bundle instanceof TPluginBundle
									? bundle.get(TAnchorPlugin)
									: undefined
							if (plugin instanceof TAnchorPlugin) created.anchor = plugin
						},
						...(bound.value ? { anchor_anchor: element } : {}),
					}),
			},
			{ attachTo: document.body },
		)

		// The bundle is announced on a microtask.
		await nextTick()

		expect(created.anchor?.anchor).toBe(element)

		bound.value = false
		await nextTick()

		expect(created.anchor?.anchor).toBeNull()

		wrapper.unmount()
	})
})
