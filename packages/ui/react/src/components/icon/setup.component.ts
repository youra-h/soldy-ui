import { IconDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { IconProps } from './base.component'

export function useSetupIcon(props: IconProps) {
	return useComponent((create) => create(IconDescriptor(), { ctrl: props.ctrl, props }), props)
}
