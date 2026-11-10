import type { IButton, IButtonProps, TButtonEvents } from '../button'
import type { TChangeEvent, TValuePayload } from '../../../common'

export interface IToggleButtonProps extends IButtonProps {
	/** Persistent pressed state; the accessible name stays unchanged. */
	pressed?: boolean
}

export type TToggleButtonEvents = TButtonEvents & {
	'change:pressed:before': (event: TChangeEvent<boolean>) => void
	'change:pressed': (payload: TValuePayload<boolean>) => void
}

export interface IToggleButton extends IButton<IToggleButtonProps, TToggleButtonEvents> {
	pressed: boolean
	toggle(): void
}
