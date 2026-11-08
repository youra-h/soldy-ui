import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TToastsLayoutPluginEvents = TPluginEvents & {
	'change:styles': (payload: TValuePayload<Record<string, string | number>>) => void
}
