/**
 * Breadcrumbs descriptor: ordered locations, projected overflow window and content slots.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../protected/define'
import { TBreadcrumbs } from '@soxa-ui/core'
import type { TBreadcrumbsItem } from '@soxa-ui/core'
import { StylableDescriptor } from './stylable.descriptor'
import { BreadcrumbsNamesPluginDescriptor, BreadcrumbsFocusPluginDescriptor } from '../plugins'

const scope = {
	item: defineType<TBreadcrumbsItem>(Object),
	index: defineType<number>(Number),
	current: defineType<boolean>(Boolean),
}
export const BreadcrumbsDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBreadcrumbs,
		extends: StylableDescriptor(),
		contribution: {
			slots: {
				item: {
					scope,
					description: 'Location content inside its native link or text wrapper',
				},
				'item-leading': { scope, description: 'Content before the location text' },
				'item-trailing': { scope, description: 'Content after the location text' },
			},
			props: {
				items: { type: Array, triggers: ['change:items'] },
				maxItems: { type: Number, triggers: ['change:maxItems'] },
				entries: {
					type: Array,
					protected: true,
					triggers: ['change:items', 'change:maxItems'],
				},
				hiddenEntries: {
					type: Array,
					protected: true,
					triggers: ['change:items', 'change:maxItems'],
				},
				overflowAria: { type: Object, protected: true, triggers: ['change:overflowAria'] },
			},
			events: ['change:items', 'change:maxItems'],
		},
		plugins: [BreadcrumbsNamesPluginDescriptor, BreadcrumbsFocusPluginDescriptor],
	}),
)
