import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { InputControlDescriptor } from '@soxa-ui/setup'
import type { IInputControl } from '@soxa-ui/core'

export const emitsInputControl: TEmits = useEmits(InputControlDescriptor())

export const propsInputControl: TProps = useProps(InputControlDescriptor()) as TProps

export type InputControlProps = UseProps<typeof InputControlDescriptor, IInputControl<string>>

export default {
	name: 'BaseInputControl',
	emits: emitsInputControl,
	props: propsInputControl,
}
