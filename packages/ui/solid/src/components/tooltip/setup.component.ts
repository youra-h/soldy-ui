import { TooltipDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { TooltipProps } from './base.component'

export function setupTooltip(props: TooltipProps) {
	const adapter = createSolidAdapterContext(TooltipDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
