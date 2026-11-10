import type { IBadge } from '@soxa-ui/core'
import { TBasePlugin, type IPluginContext } from '../../base'
import { TAriaPlugin } from '../component-view/aria.plugin'

/** Only the indicator receives semantics; the anchor remains independent. */
export class TBadgeAriaPlugin extends TBasePlugin<IBadge> {
	override install(ctx: IPluginContext): void {
		super.install(ctx)

		const badge = ctx.getInstance<IBadge>()
		const name = ctx.get(TAriaPlugin)

		if (!badge || !name) return

		const sync = (): void => {
			badge.aria.add('role', name.named ? 'img' : null)
			badge.aria.add('aria-hidden', !name.named && badge.dot ? 'true' : null)
		}

		sync()

		this._listenTo(badge.events, 'change:dot', sync)
		this._listenTo(name.events, 'change:label', sync)
		this._listenTo(name.events, 'change:labelledBy', sync)
	}
}
