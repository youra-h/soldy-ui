import type { TValuePayload } from '@soxa-ui/core'
import type { TPluginEvents } from '../../../base'

export type TFrameLayoutPluginEvents = TPluginEvents & {
	'change:styles': (payload: TValuePayload<Record<string, string | number>>) => void
}
