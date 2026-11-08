import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { SliderDescriptor } from '@soxa-ui/setup'
import type { ISlider } from '@soxa-ui/core'

export const emitsSlider: TEmits = useEmits(SliderDescriptor())

export const propsSlider: TProps = useProps(SliderDescriptor()) as TProps

export type SliderProps = UseProps<typeof SliderDescriptor, ISlider>

export default {
	name: 'BaseSlider',
	emits: emitsSlider,
	props: propsSlider,
}
