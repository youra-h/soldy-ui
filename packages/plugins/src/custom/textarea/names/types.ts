import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TTextareaNamesPluginEvents = TPluginEvents & {
	/**
	 * change:counter — текст счётчика сменился: набранное, предел или локаль
	 */
	'change:counter': (payload: TValuePayload<string>) => void
}
