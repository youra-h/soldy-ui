import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { ToggleButtonProps } from './base.component'

export function setupToggleButton(props: ToggleButtonProps) {
	const adapter = createSolidAdapterContext(ToggleButtonDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
