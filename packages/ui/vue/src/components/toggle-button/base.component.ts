import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import type { IToggleButton } from '@soxa-ui/core'

export const emitsToggleButton: TEmits = useEmits(ToggleButtonDescriptor())

export const propsToggleButton: TProps = useProps(ToggleButtonDescriptor()) as TProps

export type ToggleButtonProps = UseProps<typeof ToggleButtonDescriptor, IToggleButton>

export default {
	name: 'BaseToggleButton',
	emits: emitsToggleButton,
	props: propsToggleButton,
}
