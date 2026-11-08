import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TListHeightPluginEvents = TPluginEvents & {
	/**
	 * Строки списка измерились или перестали мериться — `measured` сменился.
	 * Нужно соседу по набору (`TListScrollPlugin`), а не потребителю: в
	 * дескриптор событие не публикуется.
	 */
	'change:measured': (payload: TValuePayload<boolean>) => void
}
