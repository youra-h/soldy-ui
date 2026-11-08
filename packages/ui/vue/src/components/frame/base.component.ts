import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { FrameDescriptor } from '@soxa-ui/setup'
import type { IFrame } from '@soxa-ui/core'

export const emitsFrame: TEmits = useEmits(FrameDescriptor())

export const propsFrame: TProps = useProps(FrameDescriptor()) as TProps

export type FrameProps = UseProps<typeof FrameDescriptor, IFrame>

export default {
	name: 'BaseFrame',
	emits: emitsFrame,
	props: propsFrame,
}
