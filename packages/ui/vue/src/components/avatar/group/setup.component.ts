import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import { useAdapter, useExpose, createVueAdapterContext, type SetupContext } from '../../../adapter'
import BaseAvatarGroup, { type AvatarGroupProps } from './base.component'

export default {
	name: '_AvatarGroup',
	extends: BaseAvatarGroup,
	expose: useExpose(),

	setup(props: AvatarGroupProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(AvatarGroupDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		return useAdapter(adapter, props, emit)
	},
}
