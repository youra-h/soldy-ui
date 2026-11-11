import { SeparatorDescriptor } from '@soxa-ui/setup'
import { useAdapter, useExpose, createVueAdapterContext, type SetupContext } from '../../adapter'
import BaseSeparator, { type SeparatorProps } from './base.component'

export default {
	name: '_Separator',
	extends: BaseSeparator,
	expose: useExpose(),
	setup(props: SeparatorProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(SeparatorDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		return useAdapter(adapter, props, emit)
	},
}
