import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { ProgressLinearDescriptor } from '@soxa-ui/setup'
import type { IProgressLinear } from '@soxa-ui/core'

export const emitsProgressLinear: TEmits = useEmits(ProgressLinearDescriptor())

export const propsProgressLinear: TProps = useProps(ProgressLinearDescriptor()) as TProps

export type ProgressLinearProps = UseProps<typeof ProgressLinearDescriptor, IProgressLinear>

export default {
	name: 'BaseProgressLinear',
	emits: emitsProgressLinear,
	props: propsProgressLinear,
}
