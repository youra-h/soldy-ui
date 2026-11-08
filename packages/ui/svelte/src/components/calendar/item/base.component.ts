import type { ICalendarItem } from '@soxa-ui/core'
import type { CalendarCollectionItemDescriptor, CalendarItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type CalendarItemEventProps = EventProps<typeof CalendarItemDescriptor> &
	EventProps<typeof CalendarCollectionItemDescriptor>

/** Входов у дня нет: дату и состояние пишут вид и расширения коллекции. */
export type CalendarItemProps = UseDomProps<
	typeof CalendarItemDescriptor,
	ICalendarItem,
	CalendarItemEventProps
>
