import { ScrollerDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { ScrollerProps } from './base.component'

export function setupScroller(props: ScrollerProps) {
	const adapter = createSolidAdapterContext(ScrollerDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
