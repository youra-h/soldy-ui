/**
 * Standalone toggle button: persistent pressed state and normalized activation.
 */

import { defineComponent, defineDescriptor } from '../../../protected/define'
import { TToggleButton } from '@soxa-ui/core'
import { ButtonDescriptor, BUTTON_SLOTS } from './button.descriptor'
import { ToggleButtonPluginDescriptor } from '../plugins'

/** Standalone pressed state; group items get their state from the collection. */
export const ToggleButtonDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TToggleButton,
		extends: ButtonDescriptor(),
		contribution: {
			props: { pressed: { type: Boolean, triggers: ['change:pressed'] } },
			events: ['change:pressed:before', 'change:pressed'],
			slots: BUTTON_SLOTS,
		},
		plugins: [ToggleButtonPluginDescriptor],
	}),
)
