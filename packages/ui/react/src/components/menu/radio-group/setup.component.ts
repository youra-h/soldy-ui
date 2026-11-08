import {
	MenuRadioGroupDescriptor,
	TItemGroupExtension,
	TMenuRadioGroupExtension,
} from '@soxa-ui/setup'
import { useComponent } from '../../../adapter'
import type { MenuRadioGroupProps } from './base.component'

export function useSetupMenuRadioGroup(props: MenuRadioGroupProps) {
	return useComponent(
		(create, elevator) =>
			create(MenuRadioGroupDescriptor(), { ctrl: props.ctrl, props })
				.use(TItemGroupExtension, { elevator })
				.use(TMenuRadioGroupExtension, { elevator }),
		props,
	)
}
