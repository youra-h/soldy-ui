import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { ScrollerDescriptor } from '@soxa-ui/setup'
import type { IScroller } from '@soxa-ui/core'

export const emitsScroller: TEmits = useEmits(ScrollerDescriptor())

export const propsScroller: TProps = useProps(ScrollerDescriptor()) as TProps

export type ScrollerProps = UseProps<typeof ScrollerDescriptor, IScroller>

export default {
	name: 'BaseScroller',
	emits: emitsScroller,
	props: propsScroller,
}
