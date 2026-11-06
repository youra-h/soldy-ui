/**
 * Дескриптор AccordionItem (TAccordionItem).
 *
 * Наследует ValueControlDescriptor (value, name, disabled, focused, size, variant, ...)
 * и добавляет text, arrowPlacement, слоты заголовка и панели + коллекционные
 * item-пропсы (selected, order, view).
 */

import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { TAccordionItem } from '@soldy-ui/core'
import type { IAccordionItem } from '@soldy-ui/core'
import { headerIn } from '@soldy-ui/plugins'
import { ValueControlDescriptor } from '../value-control.descriptor'
import { OWNER_STYLE_PROPS } from '../stylable.descriptor'
import {
	AccordionItemIdsPluginDescriptor,
	ActionPluginDescriptor,
	IdPluginDescriptor,
} from '../../plugins'

export const AccordionItemDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAccordionItem,

		extends: ValueControlDescriptor(),

		contribution: {
			/**
			 * The default slot is the panel inside the section. Its header uses
			 * `header`, since `content` names the panel at the owner level
			 * (`item-content`). The slot name differs from the `text` prop.
			 *
			 * The arrow sits at the header edge selected by `arrowPlacement`.
			 * `arrow-icon` replaces it there; the default uses the `arrowRight`
			 * role from the icon package.
			 *
			 * Each slot carries its own section (`item`) in scope — the section
			 * hands itself to the slot, like a table row's `row`
			 * (`table/row/Cells.vue`). So the owner relays slots as given, no
			 * key of its own (`RELAYS` in `item-slots.spec.ts`, `key: null`),
			 * and never touches its loop variable (AGENTS.md, Pitfalls).
			 */
			slots: {
				default: {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Содержимое раскрывающейся панели',
				},
				'arrow-icon': {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Стрелка заголовка на стороне arrowPlacement',
				},
				leading: {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'Перед текстом заголовка',
				},
				header: {
					scope: {
						item: defineType<IAccordionItem>(Object),
						text: defineType<string>(String),
						selected: defineType<boolean>(Boolean),
					},
					description: 'Текст заголовка. Задано — переопределяет проп text',
				},
				trailing: {
					scope: { item: defineType<IAccordionItem>(Object) },
					description: 'После текста заголовка',
				},
			},
			props: {
				// Размер и вид секции задаёт аккордеон: входы сняты
				...OWNER_STYLE_PROPS,
				text: { type: String, triggers: ['change:text'] },
				arrowPlacement: { type: String, triggers: ['change:arrowPlacement'] },
				/**
				 * Атрибуты панели. Набор секции, а не свой: панель лежит внутри
				 * секции и экземпляра у неё нет.
				 */
				contentAria: { type: Object, protected: true, triggers: ['change:contentAria'] },
			},
			events: ['change:text', 'change:arrowPlacement'],
		},

		plugins: [
			// Фокус держит заголовок, а корень — обёртка заголовка и панели: туда
			// `focused = true` и ставит фокус
			ActionPluginDescriptor.with({ focusTarget: headerIn }),
			// Связка «заголовок ↔ панель»: `id` обеих и ссылки между ними; `id`
			// заголовка — проп `id` или от монтирования
			IdPluginDescriptor,
			AccordionItemIdsPluginDescriptor,
		],
	}),
)
