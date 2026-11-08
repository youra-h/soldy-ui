import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { DrawerDescriptor } from '@soxa-ui/setup'
import type { IDrawer } from '@soxa-ui/core'

export const emitsDrawer: TEmits = useEmits(DrawerDescriptor())

export const propsDrawer: TProps = useProps(DrawerDescriptor()) as TProps

export type DrawerProps = UseProps<typeof DrawerDescriptor, IDrawer>

export default {
	name: 'BaseDrawer',
	emits: emitsDrawer,
	props: propsDrawer,
}
