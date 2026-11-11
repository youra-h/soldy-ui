import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../../adapter'
import type { AvatarGroupProps } from './base.component'

export function useSetupAvatarGroup(props: AvatarGroupProps) {
	return useComponent(
		(create) => create(AvatarGroupDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
