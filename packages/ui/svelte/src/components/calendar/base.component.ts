import type { ICalendar } from '@soxa-ui/core'
import type { CalendarCollectionDescriptor, CalendarDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type CalendarEventProps = EventProps<typeof CalendarDescriptor> &
	EventProps<typeof CalendarCollectionDescriptor>

export type CalendarProps = UseDomProps<typeof CalendarDescriptor, ICalendar, CalendarEventProps>
