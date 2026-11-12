import { TActionEvent, TAria } from '../../../common'
import { TModalLayer } from '../../base/modal-layer'
import type { TCloseReason } from '../../base/layer'
import type { IAlertDialog, IAlertDialogProps, TAlertDialogEvents } from './types'

/** A modal confirmation: the application performs the operation after hearing a choice. */
export default class TAlertDialog
	extends TModalLayer<IAlertDialogProps, TAlertDialogEvents>
	implements IAlertDialog
{
	static override baseClass = 'so-alert-dialog'

	private readonly _bodyAria: TAria
	private _choosing = false

	constructor(props: Partial<IAlertDialogProps> = {}) {
		super(props)

		this._aria.add('role', 'alertdialog')
		this._bodyAria = new TAria()
		this._bodyAria.subscribe((_set, oldValue) =>
			this.events.emit('change:bodyAria', { newValue: this._bodyAria.toObject(), oldValue }),
		)
	}

	get bodyAria(): TAria {
		return this._bodyAria
	}

	// Bound commands can be passed directly through scoped slots.
	readonly confirm = (): void => this._choose('confirm', 'button')
	readonly cancel = (): void => this._choose('cancel', 'button')

	override requestClose(reason: TCloseReason): void {
		if (reason === 'outside' || (reason === 'escape' && !this.dismissible)) return

		this._choose('cancel', reason)
	}

	private _choose(choice: 'confirm' | 'cancel', reason: TCloseReason): void {
		if (!this.visible || this._choosing) return

		this._choosing = true

		try {
			const event = new TActionEvent()

			this.events.emit(choice, event)

			if (!event.defaultPrevented) super.requestClose(reason)
		} finally {
			this._choosing = false
		}
	}
}
