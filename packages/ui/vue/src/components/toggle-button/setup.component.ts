import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import { useAdapter, useExpose, createVueAdapterContext, type SetupContext } from '../../adapter'
import BaseToggleButton, { type ToggleButtonProps } from './base.component'

export default {
	name: '_ToggleButton',
	extends: BaseToggleButton,
	expose: useExpose(),
	setup(props: ToggleButtonProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(ToggleButtonDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		return useAdapter(adapter, props, emit)
	},
}
