import { ComponentViewDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { ComponentViewProps } from './base.component'

export function setupComponentView(props: ComponentViewProps) {
	const adapter = createSolidAdapterContext(ComponentViewDescriptor(), {
		ctrl: props.ctrl,
		props,
	})

	return useAdapter(adapter, props)
}
