import { AvatarDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { AvatarProps } from './base.component'

export function setupAvatar(props: AvatarProps) {
	const adapter = createSolidAdapterContext(AvatarDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
