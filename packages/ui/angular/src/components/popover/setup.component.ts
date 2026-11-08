import { PopoverDescriptor } from '@soxa-ui/setup'
import type { IPopover } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupPopover(ctrl: IPopover | undefined, props: object): TBinding<IPopover> {
	const adapter = createAngularAdapterContext(PopoverDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
