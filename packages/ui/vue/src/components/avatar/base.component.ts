import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { AvatarDescriptor } from '@soxa-ui/setup'
import type { IAvatar } from '@soxa-ui/core'

export const emitsAvatar: TEmits = useEmits(AvatarDescriptor())

export const propsAvatar: TProps = useProps(AvatarDescriptor()) as TProps

export type AvatarProps = UseProps<typeof AvatarDescriptor, IAvatar>

export default {
	name: 'BaseAvatar',
	emits: emitsAvatar,
	props: propsAvatar,
}
