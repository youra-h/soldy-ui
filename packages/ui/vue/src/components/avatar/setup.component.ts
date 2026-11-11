import { AvatarDescriptor } from '@soxa-ui/setup'
import { useAdapter, useExpose, createVueAdapterContext, type SetupContext } from '../../adapter'
import BaseAvatar, { type AvatarProps } from './base.component'

export default {
	name: '_Avatar',
	extends: BaseAvatar,
	expose: useExpose(),

	setup(props: AvatarProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(AvatarDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		return useAdapter(adapter, props, emit)
	},
}
