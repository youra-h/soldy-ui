import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { ToggleButtonProps } from './base.component'

export function useSetupToggleButton(props: ToggleButtonProps) {
	return useComponent(
		(create) => create(ToggleButtonDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
