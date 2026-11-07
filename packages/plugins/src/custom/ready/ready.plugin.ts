import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'
import { TElementPlugin } from '../element'
import type { IComponentView } from '@soldy-ui/core'

/**
 * Reports component availability through IComponentView.ready: the instance
 * exists and its root DOM element has been announced by TElementPlugin.
 * Sets true on element ready and false on removal, including replacement.
 *
 * This is an availability signal, not a barrier for other plugins' DOM
 * handlers or asynchronous work. The instance itself exists before the root.
 * TLayer uses the same flag to expose its stack position while available.
 */
export class TReadyPlugin extends TBasePlugin {
	override install(ctx: IPluginContext): void {
		super.install(ctx)

		const elementPlugin = ctx.get(TElementPlugin)

		elementPlugin?.events.on('ready', () => {
			const instance = ctx.getInstance<IComponentView>()

			if (instance) {
				instance.ready = true
			}
		})

		elementPlugin?.events.on('removed', () => {
			const instance = ctx.getInstance<IComponentView>()

			if (instance) {
				instance.ready = false
			}
		})
	}
}
