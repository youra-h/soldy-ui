import type { TActionEvent, TAria } from '../../../common'
import type { IModalLayer, IModalLayerProps } from '../../base/modal-layer'
import type { TDialogEvents } from '../dialog'

export interface IAlertDialogProps extends IModalLayerProps {}

export type TAlertDialogEvents = TDialogEvents & {
	/** A choice may be prevented to keep the dialog open, for example during an async operation. */
	confirm: (event: TActionEvent) => void
	cancel: (event: TActionEvent) => void
}

export interface IAlertDialog extends IModalLayer<IAlertDialogProps, TAlertDialogEvents> {
	readonly bodyAria: TAria
	/** Report confirmation, then request closing unless the choice was prevented. */
	confirm(): void
	/** Report cancellation, then request closing unless the choice was prevented. */
	cancel(): void
}
