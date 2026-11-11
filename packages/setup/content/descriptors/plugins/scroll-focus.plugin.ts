/**
 * Measured keyboard access for a component's existing scrolling part.
 */

import { definePlugin } from '../../../protected/define'
import { TScrollFocusPlugin } from '@soxa-ui/plugins'

export const ScrollFocusPluginDescriptor = definePlugin({
	ctor: TScrollFocusPlugin,
	namespace: 'scrollFocus',
})
