import { SeparatorDescriptor } from '@soxa-ui/setup'
import type { ISeparator } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupSeparator(ctrl: ISeparator | undefined, props: object): TBinding<ISeparator> {
	const adapter = createAngularAdapterContext(SeparatorDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
