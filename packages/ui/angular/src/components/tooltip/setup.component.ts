import { TooltipDescriptor } from '@soxa-ui/setup'
import type { ITooltip } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupTooltip(ctrl: ITooltip | undefined, props: object): TBinding<ITooltip> {
	const adapter = createAngularAdapterContext(TooltipDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
