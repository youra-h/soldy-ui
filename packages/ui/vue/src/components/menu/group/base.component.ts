import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { MenuGroupDescriptor } from '@soxa-ui/setup'
import type { IItemGroup } from '@soxa-ui/core'

export const emitsMenuGroup: TEmits = useEmits(MenuGroupDescriptor())

export const propsMenuGroup: TProps = useProps(MenuGroupDescriptor()) as TProps

export type MenuGroupProps = UseProps<typeof MenuGroupDescriptor, IItemGroup>

export default {
	name: 'BaseMenuGroup',
	emits: emitsMenuGroup,
	props: propsMenuGroup,
}
