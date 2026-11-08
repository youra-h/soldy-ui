import { FrameDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { FrameProps } from './base.component'

export function useSetupFrame(props: FrameProps) {
	return useComponent((create) => create(FrameDescriptor(), { ctrl: props.ctrl, props }), props)
}
