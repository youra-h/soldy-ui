/**
 * Breadcrumbs collection facades: membership, activation and item presentation.
 */

import { defineComponent, defineDescriptor } from '../../../../protected/define'
import { TBreadcrumbsCollectionFacade, TBreadcrumbsItemCollectionFacade } from '@soxa-ui/core'
import { CollectionDescriptor } from '../collection'
export const BreadcrumbsCollectionDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBreadcrumbsCollectionFacade,
		extends: CollectionDescriptor(),
		contribution: {
			props: {
				activeItem: { type: Object, protected: true, triggers: ['change:activation'] },
			},
			events: ['item:activated', 'item:deactivated', 'change:activation'],
		},
	}),
)

/** Expose computed item-window outputs to adapters while retaining standard active/order inputs. */
export const BreadcrumbsCollectionItemDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBreadcrumbsItemCollectionFacade,
		contribution: {
			props: {
				active: { type: Boolean, triggers: ['change:active'] },
				order: { type: Number, protected: true, triggers: ['change:order'] },
				breadcrumbs_separator: {
					type: Boolean,
					protected: true,
					triggers: ['change:window'],
				},
				// Presentation-only: collapsed items stay mounted and registered in the collection.
				breadcrumbs_shown: { type: Boolean, protected: true, triggers: ['change:window'] },
				breadcrumbs_menu: { type: Object, protected: true, triggers: ['change:window'] },
				breadcrumbs_overflowEntries: {
					type: Array,
					protected: true,
					triggers: ['change:window'],
				},
				breadcrumbs_overflowAria: {
					type: Object,
					protected: true,
					triggers: ['change:overflowAria'],
				},
			},
			events: ['change:active', 'change:order'],
		},
	}),
)
