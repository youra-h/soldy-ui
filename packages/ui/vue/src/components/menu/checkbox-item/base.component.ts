import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { MenuCheckboxItemDescriptor, MenuCollectionCheckboxItemDescriptor } from '@soxa-ui/setup'
import type { IMenuCheckboxItem } from '@soxa-ui/core'

export const emitsMenuCheckboxItem: TEmits = [
	...useEmits(MenuCheckboxItemDescriptor()),
	...useEmits(MenuCollectionCheckboxItemDescriptor()),
]

export const propsMenuCheckboxItem: TProps = {
	...(useProps(MenuCheckboxItemDescriptor()) as TProps),
	...(useProps(MenuCollectionCheckboxItemDescriptor()) as TProps),
}

export type MenuCheckboxItemProps = UseProps<typeof MenuCheckboxItemDescriptor, IMenuCheckboxItem>

export default {
	name: 'BaseMenuCheckboxItem',
	emits: emitsMenuCheckboxItem,
	props: propsMenuCheckboxItem,
}
