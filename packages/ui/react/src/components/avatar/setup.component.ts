import { AvatarDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { AvatarProps } from './base.component'

export function useSetupAvatar(props: AvatarProps) {
	return useComponent((create) => create(AvatarDescriptor(), { ctrl: props.ctrl, props }), props)
}
