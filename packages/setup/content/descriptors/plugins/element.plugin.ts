/**
 * Определение TElementPlugin (namespace `element`) — DOM-узел компонента для плагинов.
 *
 * Наружу — `element:ready` и `element:removed`: узел подключён и снят.
 */

import { definePlugin } from '../../../protected/define'
import { TElementPlugin } from '@soxa-ui/plugins'

export const ElementPluginDescriptor = definePlugin({
	ctor: TElementPlugin,
	namespace: 'element',
	contribution: {
		events: ['ready', 'removed'],
	},
})
