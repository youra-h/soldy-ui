import type { TValuePayload } from '@soldy-ui/core'
import type { TPluginEvents } from '../../base'

export type TSkeletonLayoutPluginEvents = TPluginEvents & {
	'change:styles': (payload: TValuePayload<Record<string, string | number>>) => void
}
