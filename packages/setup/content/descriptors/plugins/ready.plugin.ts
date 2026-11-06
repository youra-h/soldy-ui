/**
 * Определение TReadyPlugin (namespace `ready`) — готовность компонента к работе с DOM.
 *
 * Мост от `TElementPlugin` к `ready` инстанса: узел подключён — `true`, снят — `false`.
 */

import { definePlugin } from '../../../protected/define'
import { TReadyPlugin } from '@soldy-ui/plugins'

export const ReadyPluginDescriptor = definePlugin({
	ctor: TReadyPlugin,
	namespace: 'ready',
})
