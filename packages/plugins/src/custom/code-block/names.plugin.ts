import type { ICodeBlock } from '@soxa-ui/core'
import { TNamesPlugin } from '../../locale/names.plugin'
import type { TTranslations } from '../../locale/types'
import { CODE_BLOCK_NAMES } from '../../locale/locale'
import type { TCodeBlockNamesEvents } from './types'

/** Copy feedback follows the locale subtree, including changes after mounting. */
export class TCodeBlockNamesPlugin extends TNamesPlugin<ICodeBlock, TCodeBlockNamesEvents> {
	private _copy = ''
	private _message = ''
	get copy(): string {
		return this._copy
	}
	get message(): string {
		return this._message
	}

	protected override _name(owner: ICodeBlock, translations: TTranslations): void {
		const names = translations.codeBlock ?? CODE_BLOCK_NAMES
		owner.contentAria.add('aria-label', names.region)
		const copy = owner.copyState === 'success' ? names.copied : names.copy
		const message =
			owner.copyState === 'success'
				? names.copied
				: owner.copyState === 'error'
					? names.error
					: ''

		if (copy !== this._copy) {
			const oldValue = this._copy
			this._copy = copy
			this.events.emit('change:copy', { newValue: copy, oldValue })
		}
		if (message !== this._message) {
			const oldValue = this._message
			this._message = message
			this.events.emit('change:message', { newValue: message, oldValue })
		}
	}

	protected override _watch(owner: ICodeBlock, name: () => void): void {
		this._listenTo(owner.events, 'change:copyState', name)
	}
}
