/**
 * Определение TListKeyboardPlugin (namespace `keyboard`) — клавиатурная навигация по списку.
 */

import { definePlugin } from '../../../protected/define'
import { TListKeyboardPlugin } from '@soxa-ui/plugins'

export const ListKeyboardPluginDescriptor = definePlugin({
	ctor: TListKeyboardPlugin,
	namespace: 'keyboard',
})
