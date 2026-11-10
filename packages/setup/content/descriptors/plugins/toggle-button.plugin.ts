/**
 * Normalized activation for a standalone toggle button.
 */

import { definePlugin } from '../../../protected/define'
import { TToggleButtonPlugin } from '@soxa-ui/plugins'

export const ToggleButtonPluginDescriptor = definePlugin({
	ctor: TToggleButtonPlugin,
	namespace: 'toggleButton',
})
