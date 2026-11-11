/**
 * Avatar contract and mounted image loading.
 */
import { TAvatar } from '@soxa-ui/core'
import { defineComponent, defineDescriptor } from '../../../protected/define'
import { StylableDescriptor } from './stylable.descriptor'
import { AriaPluginDescriptor, AvatarImagePluginDescriptor } from '../plugins'

export const AvatarDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAvatar,
		extends: StylableDescriptor(),
		contribution: {
			props: {
				src: { type: String, triggers: ['change:src'] },
				initials: { type: String, triggers: ['change:initials'] },
				shape: { type: String, triggers: ['change:shape'] },
				status: { type: String, protected: true, triggers: ['change:status'] },
			},
			events: ['change:src', 'change:initials', 'change:shape', 'change:status'],
			slots: {
				fallback: {
					description: 'Replacement for initials while the image is unavailable',
				},
			},
		},
		plugins: [AriaPluginDescriptor.with({ role: 'img' }), AvatarImagePluginDescriptor],
	}),
)
