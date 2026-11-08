import { ValueControlDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { ValueControlProps } from './base.component'

export function useSetupValueControl(props: ValueControlProps) {
	return useComponent(
		(create) => create(ValueControlDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
