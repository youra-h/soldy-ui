import type { ICalendarItem } from '@soxa-ui/core'
import type { CalendarCollectionItemDescriptor, CalendarItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События дня — свои (ядро и плагины) и фасада. */
export type CalendarItemEventProps = EventProps<typeof CalendarItemDescriptor> &
	EventProps<typeof CalendarCollectionItemDescriptor>

/** Пропсы дня: входов нет — только `ctrl` и слот; атрибуты потребителя — ячейке. */
export type CalendarItemProps = UseDomProps<
	typeof CalendarItemDescriptor,
	ICalendarItem,
	CalendarItemEventProps
>
