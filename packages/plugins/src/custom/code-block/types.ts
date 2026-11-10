import type { TPluginEvents } from '../../base'
import type { TValuePayload } from '@soxa-ui/core'
export type TCodeBlockNamesEvents = TPluginEvents & {
	'change:copy': (payload: TValuePayload<string>) => void
	'change:message': (payload: TValuePayload<string>) => void
}
