import { ComponentViewDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { ComponentViewProps } from './base.component'

export function useSetupComponentView(props: ComponentViewProps) {
	return useComponent(
		(create) => create(ComponentViewDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
