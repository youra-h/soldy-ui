import type { TValuePayload } from '@soldy-ui/core'
// plugins/custom/input-bool/types.ts

import type { TPluginEvents } from '../../base'

export type TInputBoolPluginEvents = TPluginEvents & {
	'change:value': (payload: TValuePayload<boolean | undefined>) => void
}
