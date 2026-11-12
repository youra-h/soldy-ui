import type {
	TAria,
	TAriaAttributes,
	TChangeEvent,
	TValuePayload,
	TThemeRegistry,
} from '../../../common'
import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'

/** Appearance values are supplied by the active theme. */
export interface IAlertViews extends TThemeRegistry {}

export type TAlertView = Extract<keyof IAlertViews, string>

export interface IAlertProps extends IStylableProps {
	/** Show a dismissal button. Visibility remains controlled by show()/hide(). */
	closable?: boolean

	/** Theme-defined surface treatment; does not change message urgency. */
	view?: TAlertView
}

export type TAlertEvents = TStylableEvents & {
	'change:view': (payload: TValuePayload<TAlertView | undefined>) => void
	'change:closable:before': (event: TChangeEvent<boolean>) => void
	'change:closable': (payload: TValuePayload<boolean>) => void
	'change:closeAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IAlert extends IStylable<IAlertProps, TAlertEvents> {
	closable: boolean
	view: TAlertView | undefined
	readonly closeAria: TAria
}
