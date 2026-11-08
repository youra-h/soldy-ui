import type { TEmits, TProps, UseProps } from '../../types'
import { useEmits, useProps } from '../../adapter'
import { ComponentViewDescriptor } from '@soxa-ui/setup'
import type { IComponentView } from '@soxa-ui/core'

export const emitsComponentView: TEmits = useEmits(ComponentViewDescriptor())

export const propsComponentView: TProps = useProps(ComponentViewDescriptor()) as TProps

export type ComponentViewProps = UseProps<typeof ComponentViewDescriptor, IComponentView>

export default {
	name: 'BaseComponentView',
	emits: emitsComponentView,
	props: propsComponentView,
}
