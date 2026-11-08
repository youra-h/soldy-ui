import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TListItemPluginEvents = TPluginEvents & {
	'change:highlighted': (payload: TValuePayload<boolean>) => void
}
