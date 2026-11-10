import type { IToggleButton } from '@soxa-ui/core'
import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'
import { TActionPlugin } from '../action'

/** Uses normalized button activation on every tag and honors DOM cancellation. */
export class TToggleButtonPlugin extends TBasePlugin<IToggleButton> {
	private _button: IToggleButton | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)
		this._button = ctx.getInstance<IToggleButton>()
		ctx.get(TActionPlugin)?.events.on('press', this._press)
	}

	private readonly _press = (event: MouseEvent): void => {
		// React's delegated click arrives after native listeners. Wait for propagation
		// so preventDefault has the same meaning in all six adapters.
		queueMicrotask(() => {
			if (!event.defaultPrevented) this._button?.toggle()
		})
	}

	override destroy(): void {
		this._button = null
		super.destroy()
	}
}
