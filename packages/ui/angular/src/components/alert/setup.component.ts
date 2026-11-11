import { AlertDescriptor } from '@soxa-ui/setup'
import type { IAlert } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupAlert(ctrl: IAlert | undefined, props: object): TBinding<IAlert> {
	const adapter = createAngularAdapterContext(AlertDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
