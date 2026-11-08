import { LabelDescriptor } from '@soxa-ui/setup'
import type { ILabel } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupLabel(ctrl: ILabel | undefined, props: object): TBinding<ILabel> {
	const adapter = createAngularAdapterContext(LabelDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
