import type { TAria, TAriaAttributes, TChangeEvent, TValuePayload } from '../../../common'
import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'

export interface IAlertProps extends IStylableProps {
	/** Show a dismissal button. Visibility remains controlled by show()/hide(). */
	closable?: boolean
}

export type TAlertEvents = TStylableEvents & {
	'change:closable:before': (event: TChangeEvent<boolean>) => void
	'change:closable': (payload: TValuePayload<boolean>) => void
	'change:closeAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IAlert extends IStylable<IAlertProps, TAlertEvents> {
	closable: boolean
	readonly closeAria: TAria
}
