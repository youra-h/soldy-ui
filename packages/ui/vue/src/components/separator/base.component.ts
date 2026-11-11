import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { SeparatorDescriptor } from '@soxa-ui/setup'
import type { ISeparator } from '@soxa-ui/core'

export const emitsSeparator: TEmits = useEmits(SeparatorDescriptor())

export const propsSeparator: TProps = useProps(SeparatorDescriptor()) as TProps

export type SeparatorProps = UseProps<typeof SeparatorDescriptor, ISeparator>

export default {
	name: 'BaseSeparator',
	emits: emitsSeparator,
	props: propsSeparator,
}
