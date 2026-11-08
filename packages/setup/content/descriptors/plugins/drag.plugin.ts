/**
 * Определение TDragPlugin (namespace `drag`) — перетаскивание элементов коллекции.
 */

import { definePlugin } from '../../../protected/define'
import { TDragPlugin } from '@soxa-ui/plugins'

export const DragPluginDescriptor = definePlugin({
	ctor: TDragPlugin,
	namespace: 'drag',
})
