import type { IDatePicker } from '@soxa-ui/core'
import type { DatePickerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type DatePickerEventProps = EventProps<typeof DatePickerDescriptor>

/** Атрибуты — корню: якорю панели и коробке полей диапазона. */
export type DatePickerProps = UseDomProps<
	typeof DatePickerDescriptor,
	IDatePicker,
	DatePickerEventProps
>
