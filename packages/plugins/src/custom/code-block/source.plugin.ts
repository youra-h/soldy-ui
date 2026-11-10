import type { ICodeBlock } from '@soxa-ui/core'
import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'

/** Report conflicting sources after the mounting finishes its synchronous input batch. */
export class TCodeBlockSourcePlugin extends TBasePlugin<ICodeBlock> {
	private _alive = false
	private _queued = false
	private _conflicting = false

	override install(ctx: IPluginContext, options?: unknown): void {
		super.install(ctx, options)

		const owner = ctx.getInstance<ICodeBlock>()

		if (!owner) return

		this._alive = true
		const schedule = () => this._schedule(owner)
		this._listenTo(owner.events, 'change:code', schedule)
		this._listenTo(owner.events, 'change:snippets', schedule)
		schedule()
	}

	private _schedule(owner: ICodeBlock): void {
		if (this._queued) return

		this._queued = true
		queueMicrotask(() => {
			this._queued = false
			if (!this._alive) return

			const conflicting = Boolean(owner.code && owner.snippets?.length)
			if (conflicting && !this._conflicting)
				console.warn(
					'[soxa] CodeBlock: snippets takes precedence over code; pass only one source.',
				)
			this._conflicting = conflicting
		})
	}

	override destroy(): void {
		this._alive = false
		super.destroy()
	}
}
