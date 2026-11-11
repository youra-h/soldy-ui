import type { IAlert } from '@soxa-ui/core'
import { TNamesPlugin } from '../../locale/names.plugin'
import type { TTranslations } from '../../locale/types'

/** Dismissal names follow the mounting subtree's locale, including server rendering. */
export class TAlertNamesPlugin extends TNamesPlugin<IAlert> {
	protected override _name(owner: IAlert, translations: TTranslations): void {
		// Older complete custom locales already provide a translated dismissal name.
		owner.closeAria.add('aria-label', translations.alert?.close ?? translations.modal.close)
	}
}
