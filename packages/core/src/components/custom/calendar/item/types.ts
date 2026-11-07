import type { TValuePayload } from '../../../../common'
import type { IControl, IControlProps, TControlEvents } from '../../../base/control'
import type { TChangeEvent, TCalendarDate } from '../../../../common'

export type TCalendarItemEvents = TControlEvents & {
	/** change:date */
	'change:date': (payload: TValuePayload<TCalendarDate>) => void
	/** change:text */
	'change:text': (payload: TValuePayload<string>) => void
	/** change:unavailable */
	'change:unavailable': (payload: TValuePayload<boolean>) => void
	/** Запись `unavailable` — подправить или отменить (`TChangeEvent`) */
	'change:unavailable:before': (e: TChangeEvent<boolean>) => void
}

export interface ICalendarItemProps extends IControlProps {
	/** Дата дня */
	date?: TCalendarDate
	/** Номер дня в цифрах локали — текст ячейки */
	text?: string
	/**
	 * День недоступен: фокус на него встаёт, выбрать нельзя. Пишет его правило
	 * календаря (`unavailable` владельца)
	 */
	unavailable?: boolean
}

export interface ICalendarItem<
	TProps extends ICalendarItemProps = ICalendarItemProps,
	TEvents extends TCalendarItemEvents = TCalendarItemEvents,
> extends IControl<TProps, TEvents> {
	/** Дата дня */
	date: TCalendarDate
	/** Номер дня в цифрах локали */
	text: string
	/** Недоступен: фокус встаёт, выбор — нет */
	unavailable: boolean
}
