/**
 * Keyboard navigation and activation for a collection of toggle buttons.
 */

import { definePlugin } from '../../../protected/define'
import { TToggleGroupPlugin } from '@soxa-ui/plugins'

export const ToggleGroupPluginDescriptor = definePlugin({
	ctor: TToggleGroupPlugin,
	namespace: 'keyboard',
})
