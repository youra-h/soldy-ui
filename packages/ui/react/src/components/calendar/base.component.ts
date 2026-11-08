import type { ICalendar } from '@soxa-ui/core'
import type { CalendarCollectionDescriptor, CalendarDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Calendar — свои и фасада коллекции: колбэки обоих контекстов — пропсы компонента. */
export type CalendarEventProps = EventProps<typeof CalendarDescriptor> &
	EventProps<typeof CalendarCollectionDescriptor>

/** Пропсы Calendar; коллекционные входы (`engine`, `mode`) несёт `ICalendarProps`. */
export type CalendarProps = UseDomProps<typeof CalendarDescriptor, ICalendar, CalendarEventProps>
