import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import type { IAvatarGroup } from '@soxa-ui/core'

export const emitsAvatarGroup: TEmits = useEmits(AvatarGroupDescriptor())

export const propsAvatarGroup: TProps = useProps(AvatarGroupDescriptor()) as TProps

export type AvatarGroupProps = UseProps<typeof AvatarGroupDescriptor, IAvatarGroup>

export default {
	name: 'BaseAvatarGroup',
	emits: emitsAvatarGroup,
	props: propsAvatarGroup,
}
