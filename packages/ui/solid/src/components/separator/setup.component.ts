import { SeparatorDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { SeparatorProps } from './base.component'

export function setupSeparator(props: SeparatorProps) {
	const adapter = createSolidAdapterContext(SeparatorDescriptor(), {
		ctrl: props.ctrl,
		props,
	})

	return useAdapter(adapter, props)
}
