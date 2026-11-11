import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../../adapter'
import type { AvatarGroupProps } from './base.component'

export function setupAvatarGroup(props: AvatarGroupProps) {
	const adapter = createSolidAdapterContext(AvatarGroupDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
