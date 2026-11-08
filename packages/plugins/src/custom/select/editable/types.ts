import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TEditablePluginEvents = TPluginEvents & {
	/** change:query — сменился текст, набранный в поле */
	'change:query': (payload: TValuePayload<string>) => void
}
