import { ControlDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { ControlProps } from './base.component'

export function useSetupControl(props: ControlProps) {
	return useComponent((create) => create(ControlDescriptor(), { ctrl: props.ctrl, props }), props)
}
