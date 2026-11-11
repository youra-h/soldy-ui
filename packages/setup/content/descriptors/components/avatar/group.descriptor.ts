/**
 * Explicit avatar group overflow and its scoped content slot.
 */
import { TAvatarGroup } from '@soxa-ui/core'
import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { ComponentViewDescriptor } from '../component-view.descriptor'
import { AriaPluginDescriptor } from '../../plugins'

export const AvatarGroupDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAvatarGroup,
		extends: ComponentViewDescriptor(),
		contribution: {
			props: {
				overflow: { type: Number, triggers: ['change:overflow'] },
				displayOverflow: { type: String, protected: true, triggers: ['change:overflow'] },
			},
			events: ['change:overflow'],
			slots: {
				default: { description: 'Avatars selected by the application' },
				'overflow-content': {
					description: 'Replacement for the overflow count',
					scope: { count: defineType<number>(Number) },
				},
			},
		},
		plugins: [AriaPluginDescriptor],
	}),
)
