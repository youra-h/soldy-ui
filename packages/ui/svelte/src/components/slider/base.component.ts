import type { ISlider } from '@soxa-ui/core'
import type { SliderDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type SliderEventProps = EventProps<typeof SliderDescriptor>

/** Атрибуты — корню: полей столько, сколько ручек. */
export type SliderProps = UseDomProps<typeof SliderDescriptor, ISlider, SliderEventProps>
