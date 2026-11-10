import { TActivationItemFacade } from '../../../../base/collection'
import type { TItemContext } from '../../../../base/collection'
import type {
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsItemCollectionFacadeEvents,
} from '../../collection/types'
import type { IBreadcrumbsItem } from '../types'

export class TBreadcrumbsItemCollectionFacade extends TActivationItemFacade<
	IBreadcrumbsItem,
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsItemCollectionFacadeEvents
> {
	override setContext(
		context: TItemContext<IBreadcrumbsItem, TBreadcrumbsCollectionExtensions>,
	): void {
		super.setContext(context)

		if (!this._context) return

		this.events.relayAll(this._context.adapters.breadcrumbs.events)
	}

	get breadcrumbs_separator() {
		return this._context ? this._context.adapters.breadcrumbs.separator : false
	}

	get breadcrumbs_shown() {
		return this._context?.adapters.breadcrumbs.shown ?? true
	}

	get breadcrumbs_menu() {
		return this._context?.adapters.breadcrumbs.menu ?? null
	}

	get breadcrumbs_overflowEntries() {
		return this._context?.adapters.breadcrumbs.overflowEntries ?? []
	}

	get breadcrumbs_overflowAria() {
		return this._context?.adapters.breadcrumbs.overflowAria
	}
}
