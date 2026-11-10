/**
 * ToggleGroup owner: group semantics, slots, inherited appearance and keyboard behavior.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { TToggleGroup } from '@soxa-ui/core'
import type { IToggleGroupItem } from '@soxa-ui/core'
import { toggleStopOf } from '@soxa-ui/plugins'
import { ControlDescriptor } from '../control.descriptor'
import {
	ActionPluginDescriptor,
	CollectionBundlesPluginDescriptor,
	CollectionElementsPluginDescriptor,
	ToggleGroupPluginDescriptor,
} from '../../plugins'

/** The group owns semantics; the selection facade owns items and selected state. */
export const ToggleGroupDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TToggleGroup,
		extends: ControlDescriptor(),
		contribution: {
			props: {
				view: { type: String, triggers: ['change:view'] },
				orientation: { type: String, triggers: ['change:orientation'] },
			},
			events: ['change:view', 'change:orientation'],
			slots: {
				default: {},
				item: {
					scope: {
						item: defineType<IToggleGroupItem>(Object),
						text: defineType<string>(String),
						selected: defineType<boolean>(Boolean),
					},
				},
				'item-leading': { scope: { item: defineType<IToggleGroupItem>(Object) } },
				'item-trailing': { scope: { item: defineType<IToggleGroupItem>(Object) } },
			},
		},
		plugins: [
			ActionPluginDescriptor.with({ focusTarget: toggleStopOf }),
			CollectionBundlesPluginDescriptor,
			CollectionElementsPluginDescriptor,
			ToggleGroupPluginDescriptor,
		],
	}),
)
