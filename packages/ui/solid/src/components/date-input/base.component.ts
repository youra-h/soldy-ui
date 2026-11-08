import type { IDateInput } from '@soxa-ui/core'
import type { DateInputDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События DateInput. */
export type DateInputEventProps = EventProps<typeof DateInputDescriptor>

/** Пропсы DateInput: атрибуты потребителя — корню целиком, поля ввода у даты нет. */
export type DateInputProps = UseDomProps<
	typeof DateInputDescriptor,
	IDateInput,
	DateInputEventProps
>
