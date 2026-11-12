import type { IDialog } from '@soxa-ui/core'
import type { TAlertDialogNamesPluginEvents } from './types'
import { TDialogNamesPlugin } from '../../dialog/names'
import type { TTranslations } from '../../../locale/types'
import { ALERT_DIALOG_NAMES } from '../../../locale/locale'

/** Visible default labels follow the subtree locale, including live changes. */
export class TAlertDialogNamesPlugin extends TDialogNamesPlugin<TAlertDialogNamesPluginEvents> {
	private _confirm = ''
	private _cancel = ''

	get confirm(): string {
		return this._confirm
	}

	get cancel(): string {
		return this._cancel
	}

	protected override _name(owner: IDialog, translations: TTranslations): void {
		super._name(owner, translations)

		// Older complete custom locales have no AlertDialog section.
		const labels = translations.alertDialog ?? ALERT_DIALOG_NAMES
		const confirm = labels.confirm
		const cancel = labels.cancel

		if (this._confirm !== confirm) {
			const oldValue = this._confirm
			this._confirm = confirm
			this.events.emit('change:confirm', { newValue: confirm, oldValue })
		}

		if (this._cancel !== cancel) {
			const oldValue = this._cancel
			this._cancel = cancel
			this.events.emit('change:cancel', { newValue: cancel, oldValue })
		}
	}
}
