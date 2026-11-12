import type { TActionEvent, TAria, TAriaAttributes, TValuePayload } from '../../../common'
import type { IModalLayer, IModalLayerProps, TModalLayerEvents } from '../../base/modal-layer'

export interface IAlertDialogProps extends IModalLayerProps {}

export type TAlertDialogEvents = TModalLayerEvents & {
	/** A choice may be prevented to keep the dialog open, for example during an async operation. */
	confirm: (event: TActionEvent) => void
	cancel: (event: TActionEvent) => void
	'change:bodyAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IAlertDialog extends IModalLayer<IAlertDialogProps, TAlertDialogEvents> {
	readonly bodyAria: TAria
	/** Report confirmation, then request closing unless the choice was prevented. */
	confirm(): void
	/** Report cancellation, then request closing unless the choice was prevented. */
	cancel(): void
}
