import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TAlertDialogNamesPluginEvents = TPluginEvents & {
	'change:confirm': (payload: TValuePayload<string>) => void
	'change:cancel': (payload: TValuePayload<string>) => void
}
