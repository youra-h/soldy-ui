/**
 * Selection-backed owner and item facades of ToggleGroup.
 */

import { defineComponent, defineDescriptor } from '../../../../protected/define'
import { TToggleGroupCollectionFacade, TToggleGroupItemCollectionFacade } from '@soxa-ui/core'
import { CollectionDescriptor } from '../collection'

export const ToggleGroupCollectionDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TToggleGroupCollectionFacade,

		extends: CollectionDescriptor(),

		contribution: {
			props: {
				mode: { type: String, triggers: ['change:mode'] },
				selected: { type: Array, protected: true, triggers: ['change:selection'] },
			},
			events: ['change:mode', 'change:selection'],
		},
	}),
)

export const ToggleGroupCollectionItemDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TToggleGroupItemCollectionFacade,

		contribution: {
			props: {
				selected: { type: Boolean, triggers: ['change:selected'] },
				order: { type: Number, protected: true, triggers: ['change:order'] },
				view: {
					type: String,
					protected: true,
					triggers: ['change:view'],
				},
			},
			events: ['change:selected', 'change:order'],
		},
	}),
)
