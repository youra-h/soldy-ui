import { BadgeDescriptor } from '@soxa-ui/setup'
import { useAdapter, useExpose, createVueAdapterContext, type SetupContext } from '../../adapter'
import BaseBadge, { type BadgeProps } from './base.component'

export default {
	name: '_Badge',
	extends: BaseBadge,
	expose: useExpose(),
	setup(props: BadgeProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(BadgeDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		return useAdapter(adapter, props, emit)
	},
}
