/**
 * Дескриптор Accordion (TAccordion).
 *
 * Наследование:
 * - ControlDescriptor (disabled, focused, size, variant, rendered, visible, present, tag, classes)
 *
 * Добавляет: view + плагины (коллекция + drag-and-drop).
 */

import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { TAccordion } from '@soxa-ui/core'
import type { IAccordionItem } from '@soxa-ui/core'
import { firstHeaderOf } from '@soxa-ui/plugins'
import { ControlDescriptor } from '../control.descriptor'
import {
	ActionPluginDescriptor,
	CollectionBundlesPluginDescriptor,
	CollectionElementsPluginDescriptor,
	DragPluginDescriptor,
} from '../../plugins'

export const AccordionDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAccordion,

		extends: ControlDescriptor(),

		contribution: {
			/**
			 * Слоты элементов статические и получают элемент через scope:
			 * динамические имена вида `item:<value>:leading` резолвит только Vue.
			 * Адресация конкретного элемента — условием внутри слота по `item.value`.
			 *
			 * Панель отдельным компонентом не стала: она лежит внутри элемента и
			 * отдельно от него не существует, поэтому осталась слотом `item-content`.
			 * Сравни с Tabs, где панель — сосед списка, пишется отдельно и
			 * связывается по `value`.
			 *
			 * Каждый слот элемента есть здесь как `item-<слот>`, и scope у него —
			 * scope слота элемента плюс сам элемент. Имена — по смыслу у владельца:
			 * заголовок элемента (`header`) — `item`, панель (`default`) —
			 * `item-content`.
			 */
			slots: {
				default: { description: 'Элементы коллекции' },
				item: {
					scope: {
						item: defineType<IAccordionItem>(Object),
						text: defineType<string>(String),
						selected: defineType<boolean>(Boolean),
					},
					description: 'Заголовок элемента при работе через проп items',
				},
				'item-arrow-icon': {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Стрелка заголовка элемента на стороне arrowPlacement',
				},
				'item-leading': {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Перед заголовком элемента',
				},
				'item-trailing': {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'После заголовка элемента',
				},
				'item-content': {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Содержимое раскрывающейся панели',
				},
			},
			props: {
				view: { type: String, triggers: ['change:view'] },
			},
			events: ['change:view'],
		},

		plugins: [
			// Фокус держат заголовки секций, а корень — контейнер секций:
			// `focused = true` ставит фокус на заголовок первой доступной секции.
			// Секции плагин берёт у коллекции, через реестр элементов ниже
			ActionPluginDescriptor.with({ focusTarget: firstHeaderOf }),
			// Коллекция: реестр bundles + доступ к DOM-элементам
			CollectionBundlesPluginDescriptor,
			CollectionElementsPluginDescriptor,
			// Drag-and-drop
			DragPluginDescriptor,
		],
	}),
)
