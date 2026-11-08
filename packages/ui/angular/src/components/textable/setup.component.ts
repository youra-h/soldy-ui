import { TextableDescriptor } from '@soxa-ui/setup'
import type { ITextable } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupTextable(ctrl: ITextable | undefined, props: object): TBinding<ITextable> {
	const adapter = createAngularAdapterContext(TextableDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
