import { ButtonDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { ButtonProps } from './base.component'

export function useSetupButton(props: ButtonProps) {
	return useComponent((create) => create(ButtonDescriptor(), { ctrl: props.ctrl, props }), props)
}
