import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { ValueControlDescriptor } from '@soxa-ui/setup'
import type { IValueControl } from '@soxa-ui/core'

export const emitsValueControl: TEmits = useEmits(ValueControlDescriptor())

export const propsValueControl: TProps = useProps(ValueControlDescriptor()) as TProps

export type ValueControlProps = UseProps<typeof ValueControlDescriptor, IValueControl<any>>

export default {
	name: 'BaseValueControl',
	emits: emitsValueControl,
	props: propsValueControl,
}
