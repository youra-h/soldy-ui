import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { IconDescriptor } from '@soxa-ui/setup'
import type { IIcon } from '@soxa-ui/core'

export const emitsIcon: TEmits = useEmits(IconDescriptor())

export const propsIcon: TProps = useProps(IconDescriptor()) as TProps

export type IconProps = UseProps<typeof IconDescriptor, IIcon>

export default {
	name: 'BaseIcon',
	emits: emitsIcon,
	props: propsIcon,
}
