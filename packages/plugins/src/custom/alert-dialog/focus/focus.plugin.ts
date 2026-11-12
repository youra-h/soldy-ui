import { TModalFocusPlugin } from '../../overlay/modal-focus'
import { tabStops } from '../../../utils'

/** Prefer the built-in safe action; a custom footer starts at the panel itself. */
export class TAlertDialogFocusPlugin extends TModalFocusPlugin {
	protected override _focusCandidates(panel: Element): readonly Element[] {
		const cancel = panel.querySelector(
			':scope > .so-alert-dialog__footer > .so-alert-dialog__cancel',
		)

		return cancel && tabStops(panel).includes(cancel) ? [cancel, panel] : [panel]
	}
}
