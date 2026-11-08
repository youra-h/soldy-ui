import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { MenuRadioGroupDescriptor } from '@soxa-ui/setup'
import type { IMenuRadioGroup } from '@soxa-ui/core'

export const emitsMenuRadioGroup: TEmits = useEmits(MenuRadioGroupDescriptor())

export const propsMenuRadioGroup: TProps = useProps(MenuRadioGroupDescriptor()) as TProps

export type MenuRadioGroupProps = UseProps<typeof MenuRadioGroupDescriptor, IMenuRadioGroup>

export default {
	name: 'BaseMenuRadioGroup',
	emits: emitsMenuRadioGroup,
	props: propsMenuRadioGroup,
}
