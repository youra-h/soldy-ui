import { TButton } from '../button'
import type { ICodeBlock } from './types'

/** The owned Copy button stays focusable while its clipboard request is pending. */
export class TCodeBlockCopyButton extends TButton {
	private _owner: ICodeBlock | undefined

	constructor(owner: ICodeBlock) {
		super()
		this._owner = owner
		this.sync()
	}

	sync(): void {
		this.disabled = this._owner?.copyDisabled ?? false
		this._syncDisabled()
	}

	protected override _syncDisabled(): void {
		if (this._owner?.source && this._owner.copyState === 'pending') {
			// Native disabled would blur the keyboard user before clipboard completion.
			this._attrs.remove('disabled')
			this._aria.add('aria-disabled', 'true')
			return
		}

		super._syncDisabled()
	}
}
