import { FrameDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { FrameProps } from './base.component'

export function setupFrame(props: FrameProps) {
	const adapter = createSolidAdapterContext(FrameDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
