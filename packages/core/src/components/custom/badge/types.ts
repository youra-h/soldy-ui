import type { TChangeEvent, TValuePayload, TThemeRegistry } from '../../../common'
import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'

/** Appearance values are supplied by the active theme. */
export interface IBadgeViews extends TThemeRegistry {}
export type TBadgeView = Extract<keyof IBadgeViews, string>

export interface IBadgeProps extends IStylableProps {
	/** Label or numeric count. Numeric strings are displayed unchanged. */
	value?: string | number
	/** Numeric display limit; the stored value remains unchanged. */
	max?: number
	/** Display a dot while retaining the value. */
	dot?: boolean
	view?: TBadgeView
}
export type TBadgeEvents = TStylableEvents & {
	'change:value': (payload: TValuePayload<string | number>) => void
	'change:value:before': (event: TChangeEvent<string | number>) => void
	'change:max': (payload: TValuePayload<number>) => void
	'change:dot': (payload: TValuePayload<boolean>) => void
	'change:view': (payload: TValuePayload<TBadgeView | undefined>) => void
}
export interface IBadge extends IStylable<IBadgeProps, TBadgeEvents> {
	value: string | number
	max: number
	dot: boolean
	view: TBadgeView | undefined
	readonly displayValue: string
}
