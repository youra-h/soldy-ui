import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { CalendarDescriptor, CalendarCollectionDescriptor } from '@soxa-ui/setup'
import type { ICalendar } from '@soxa-ui/core'

export const emitsCalendar: TEmits = [
	...useEmits(CalendarDescriptor()),
	...useEmits(CalendarCollectionDescriptor()),
]

export const propsCalendar: TProps = {
	...(useProps(CalendarDescriptor()) as TProps),
	...(useProps(CalendarCollectionDescriptor()) as TProps),
}

export type CalendarProps = UseProps<typeof CalendarDescriptor, ICalendar>

export default {
	name: 'BaseCalendar',
	emits: emitsCalendar,
	props: propsCalendar,
}
