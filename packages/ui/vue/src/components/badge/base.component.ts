import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { BadgeDescriptor } from '@soxa-ui/setup'
import type { IBadge } from '@soxa-ui/core'

export const emitsBadge: TEmits = useEmits(BadgeDescriptor())

export const propsBadge: TProps = useProps(BadgeDescriptor()) as TProps

export type BadgeProps = UseProps<typeof BadgeDescriptor, IBadge>

export default {
	name: 'BaseBadge',
	emits: emitsBadge,
	props: propsBadge,
}
