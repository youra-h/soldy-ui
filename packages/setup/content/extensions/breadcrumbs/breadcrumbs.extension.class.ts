/**
 * Breadcrumbs wiring: the internal Menu instance follows trail changes.
 */

import { TBreadcrumbsFocusPlugin } from '@soxa-ui/plugins'
import { TMenu } from '@soxa-ui/core'
import type { IBreadcrumbs } from '@soxa-ui/core'
import type { TInstanceContext } from '../../../protected/adapter/context'

/** Own the internal menu and close stale content before the adapters redraw it. */
export class TBreadcrumbsExtension {
	readonly menu = new TMenu()
	constructor(context: TInstanceContext<IBreadcrumbs>) {
		const close = (): void => {
			this.menu.open = false
		}
		const owner = context.instance
		const focus = context.bundle?.get(TBreadcrumbsFocusPlugin)
		if (focus) focus.menu = this.menu
		owner.events.on('change:items', close)
		owner.events.on('change:maxItems', close)
		context.events.on('destroy', () => {
			owner.events.off('change:items', close)
			owner.events.off('change:maxItems', close)
			this.menu.open = false
		})
	}
}
