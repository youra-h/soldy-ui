/**
 * Breadcrumbs navigation, content slots and shared collection DOM plugins.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../protected/define'
import { TBreadcrumbs } from '@soxa-ui/core'
import type { IBreadcrumbsItem } from '@soxa-ui/core'
import { StylableDescriptor } from './stylable.descriptor'
import {
	BreadcrumbsNamesPluginDescriptor,
	BreadcrumbsFocusPluginDescriptor,
	CollectionBundlesPluginDescriptor,
	CollectionElementsPluginDescriptor,
} from '../plugins'
export const BreadcrumbsDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBreadcrumbs,
		extends: StylableDescriptor(),
		contribution: {
			slots: {
				default: { description: 'Declarative Breadcrumbs.Item children' },
				item: {
					scope: {
						item: defineType<IBreadcrumbsItem>(Object),
						text: defineType<string>(String),
						active: defineType<boolean>(Boolean),
					},
					description: 'Location content',
				},
				'item-leading': {
					scope: { item: defineType<IBreadcrumbsItem>(Object) },
					description: 'Before location text',
				},
				'item-trailing': {
					scope: { item: defineType<IBreadcrumbsItem>(Object) },
					description: 'After location text',
				},
			},
			props: {
				maxItems: { type: Number, triggers: ['change:maxItems'] },
				overflowAria: { type: Object, protected: true, triggers: ['change:overflowAria'] },
			},
			events: ['change:maxItems'],
		},
		plugins: [
			CollectionBundlesPluginDescriptor,
			CollectionElementsPluginDescriptor,
			BreadcrumbsNamesPluginDescriptor,
			BreadcrumbsFocusPluginDescriptor,
		],
	}),
)
export {
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsCollectionItemDescriptor,
} from './breadcrumbs/collection.descriptor'
export { BreadcrumbsItemDescriptor } from './breadcrumbs/item.descriptor'
