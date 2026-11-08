import type { IDatePicker } from '@soxa-ui/core'
import type { DatePickerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События DatePicker. */
export type DatePickerEventProps = EventProps<typeof DatePickerDescriptor>

/** Пропсы DatePicker: атрибуты потребителя — корню, якорю панели. */
export type DatePickerProps = UseDomProps<
	typeof DatePickerDescriptor,
	IDatePicker,
	DatePickerEventProps
>
