/**
 * Badge contract and its noninteractive indicator semantics.
 */
import { defineComponent, defineDescriptor } from '../../../protected/define'
import { TBadge } from '@soxa-ui/core'
import { AriaPluginDescriptor, BadgeAriaPluginDescriptor } from '../plugins'
import { StylableDescriptor } from './stylable.descriptor'

export const BadgeDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBadge,
		extends: StylableDescriptor(),
		contribution: {
			slots: { anchor: { description: 'Element under the indicator' } },
			props: {
				value: { type: [String, Number], triggers: ['change:value'] },
				max: { type: Number, triggers: ['change:max'] },
				dot: { type: Boolean, triggers: ['change:dot'] },
				view: { type: String, triggers: ['change:view'] },
				displayValue: {
					type: String,
					protected: true,
					triggers: ['change:value', 'change:max', 'change:dot'],
				},
			},
			events: ['change:value', 'change:max', 'change:dot', 'change:view'],
		},
		plugins: [AriaPluginDescriptor, BadgeAriaPluginDescriptor],
	}),
)
