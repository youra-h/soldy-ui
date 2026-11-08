import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { MenuDescriptor, MenuCollectionDescriptor } from '@soxa-ui/setup'
import type { IMenu } from '@soxa-ui/core'

export const emitsMenu: TEmits = [
	...useEmits(MenuDescriptor()),
	...useEmits(MenuCollectionDescriptor()),
]

export const propsMenu: TProps = {
	...(useProps(MenuDescriptor()) as TProps),
	...(useProps(MenuCollectionDescriptor()) as TProps),
}

export type MenuProps = UseProps<typeof MenuDescriptor, IMenu>

export default {
	name: 'BaseMenu',
	emits: emitsMenu,
	props: propsMenu,
}
