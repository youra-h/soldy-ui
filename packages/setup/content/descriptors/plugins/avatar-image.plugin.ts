/**
 * The DOM image lifecycle plugin definition.
 */
import { definePlugin } from '../../../protected/define'
import { TAvatarImagePlugin } from '@soxa-ui/plugins'

export const AvatarImagePluginDescriptor = definePlugin({
	ctor: TAvatarImagePlugin,
	namespace: 'avatarImage',
})
