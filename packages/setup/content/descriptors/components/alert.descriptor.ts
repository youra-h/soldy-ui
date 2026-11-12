/**
 * Alert contract: composable inline message with optional localized dismissal.
 */

import { defineComponent, defineDescriptor } from '../../../protected/define'
import { TAlert } from '@soxa-ui/core'
import { AlertNamesPluginDescriptor, AriaPluginDescriptor } from '../plugins'
import { StylableDescriptor } from './stylable.descriptor'

export const AlertDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAlert,
		extends: StylableDescriptor(),

		contribution: {
			slots: {
				icon: { description: 'Decorative application-supplied icon' },
				title: { description: 'Message heading' },
				default: { description: 'Message content' },
				action: {
					description: 'Application actions; activation does not dismiss the message',
				},
				'close-icon': { description: 'Dismissal icon' },
			},
			props: {
				view: { type: String, triggers: ['change:view'] },
				closable: { type: Boolean, triggers: ['change:closable'] },
				closeAria: { type: Object, protected: true, triggers: ['change:closeAria'] },
			},
			events: ['change:closable', 'change:view'],
		},

		plugins: [AriaPluginDescriptor, AlertNamesPluginDescriptor],
	}),
)
