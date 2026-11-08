import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { CalendarItemDescriptor, CalendarCollectionItemDescriptor } from '@soxa-ui/setup'
import type { ICalendarItem } from '@soxa-ui/core'

export const emitsCalendarItem: TEmits = [
	...useEmits(CalendarItemDescriptor()),
	...useEmits(CalendarCollectionItemDescriptor()),
]

export const propsCalendarItem: TProps = {
	...(useProps(CalendarItemDescriptor()) as TProps),
	...(useProps(CalendarCollectionItemDescriptor()) as TProps),
}

export type CalendarItemProps = UseProps<typeof CalendarItemDescriptor, ICalendarItem>

export default {
	name: 'BaseCalendarItem',
	emits: emitsCalendarItem,
	props: propsCalendarItem,
}
