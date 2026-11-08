import type { ICalendarItem } from '@soxa-ui/core'
import type { CalendarCollectionItemDescriptor, CalendarItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События дня — свои и фасада. */
export type CalendarItemEventProps = EventProps<typeof CalendarItemDescriptor> &
	EventProps<typeof CalendarCollectionItemDescriptor>

/** Пропсы дня: входов нет — всё дню пишут календарь и расширения коллекции. */
export type CalendarItemProps = UseDomProps<
	typeof CalendarItemDescriptor,
	ICalendarItem,
	CalendarItemEventProps
>
