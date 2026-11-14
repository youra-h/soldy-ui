import type { ICodeBlock, ICodeBlockCopy } from '@soxa-ui/core'
import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'

/** Clipboard access belongs to a mounting; late completions cannot update a destroyed one. */
export class TCodeBlockCopyPlugin extends TBasePlugin<ICodeBlock> {
	private _owner: ICodeBlock | undefined
	private _alive = false
	private _request = 0
	private _inFlight: number | undefined

	override install(ctx: IPluginContext, options?: unknown): void {
		super.install(ctx, options)

		const owner = ctx.getInstance<ICodeBlock>()

		if (!owner) return

		this._owner = owner
		this._alive = true
		this._listenTo(owner.events, 'copy:request', (payload) => {
			void this._copy(owner, payload)
		})
	}

	private async _copy(owner: ICodeBlock, payload: ICodeBlockCopy): Promise<void> {
		// Feedback may reset when the source changes; the physical request is still outstanding.
		if (this._inFlight !== undefined) return

		const request = ++this._request
		this._inFlight = request
		owner.copyState = 'pending'

		try {
			// Calling writeText synchronously in the user's activation preserves browser permission.
			if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
				throw new Error('Clipboard API is unavailable in this context.')
			}
			await navigator.clipboard.writeText(payload.code)

			if (!this._alive || request !== this._request) return

			if (
				owner.copyState === 'pending' &&
				owner.copyable &&
				owner.source === payload.code &&
				owner.value === payload.value
			) {
				owner.copyState = 'success'
			}

			owner.events.emit('copy', payload)
		} catch (error) {
			if (!this._alive || request !== this._request) return

			if (
				owner.copyState === 'pending' &&
				owner.copyable &&
				owner.source === payload.code &&
				owner.value === payload.value
			) {
				owner.copyState = 'error'
			}

			owner.events.emit('copy:error', { ...payload, error })
		} finally {
			if (this._inFlight === request) this._inFlight = undefined
		}
	}

	override destroy(): void {
		this._alive = false
		this._request++
		if (this._owner?.copyState === 'pending') this._owner.copyState = 'idle'
		this._owner = undefined
		super.destroy()
	}
}
