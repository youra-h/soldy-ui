import type { TActionEvent } from '../../../common'
import type { IDialog, IDialogProps, TDialogEvents } from '../dialog'

/** These Dialog modes remain fixed instead of becoming AlertDialog inputs. */
type TFixedDialogPropName = 'modal' | 'alert' | 'placement' | 'offset' | 'maximized' | 'maximizable'

export interface IAlertDialogProps extends Omit<IDialogProps, TFixedDialogPropName> {}

export type TAlertDialogEvents = TDialogEvents & {
	/** A choice may be prevented to keep the dialog open, for example during an async operation. */
	confirm: (event: TActionEvent) => void
	cancel: (event: TActionEvent) => void
}

export interface IAlertDialog extends Omit<
	IDialog<IAlertDialogProps, TAlertDialogEvents>,
	TFixedDialogPropName | 'maximizeAria' | 'toggleMaximized'
> {
	/** Report confirmation, then request closing unless the choice was prevented. */
	confirm(): void
	/** Report cancellation, then request closing unless the choice was prevented. */
	cancel(): void
}
