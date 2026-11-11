import { SeparatorDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { SeparatorProps } from './base.component'

export function useSetupSeparator(props: SeparatorProps) {
	return useComponent(
		(create) => create(SeparatorDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
