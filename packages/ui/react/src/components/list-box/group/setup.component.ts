import { ListBoxGroupDescriptor, TItemGroupExtension } from '@soxa-ui/setup'
import { useComponent } from '../../../adapter'
import type { ListBoxGroupProps } from './base.component'

export function useSetupListBoxGroup(props: ListBoxGroupProps) {
	return useComponent(
		(create, elevator) =>
			create(ListBoxGroupDescriptor(), { ctrl: props.ctrl, props }).use(TItemGroupExtension, {
				elevator,
			}),
		props,
	)
}
