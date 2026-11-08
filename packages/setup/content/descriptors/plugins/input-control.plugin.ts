/**
 * Определение TInputControlPlugin (namespace `input-control`) — клик по полю Input.
 *
 * Глушит клик по вложенному `<input>`, пока поле `readonly` или `disabled`.
 */

import { definePlugin } from '../../../protected/define'
import { TInputControlPlugin } from '@soxa-ui/plugins'

export const InputControlPluginDescriptor = definePlugin({
	ctor: TInputControlPlugin,
	namespace: 'input-control',
})
