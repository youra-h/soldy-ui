import { TBaseItemExtension } from '../../../../../../base/collection'
import type { IBreadcrumbsItem } from '../../../../item/types'
import type { IBreadcrumbsExtension } from '../types'
import type { IBreadcrumbsItemExtension, TBreadcrumbsItemExtensionEvents } from './types'

export class TBreadcrumbsItemExtension<TItem extends IBreadcrumbsItem = IBreadcrumbsItem>
	extends TBaseItemExtension<TItem, IBreadcrumbsExtension<TItem>, TBreadcrumbsItemExtensionEvents>
	implements IBreadcrumbsItemExtension<TItem>
{
	constructor(item: TItem, parent: IBreadcrumbsExtension<TItem>) {
		super(item, parent)
		this.events.relay(parent.events, ['change:window', 'change:overflowAria'])
	}

	get separator() {
		return this._parent.firstItem !== this._item
	}

	get shown() {
		return !this._parent.isCollapsed(this._item)
	}

	get menu() {
		return this._parent.firstItem === this._item && this._parent.overflowEntries.length
			? this._parent.menu
			: null
	}

	get overflowEntries() {
		return this._parent.overflowEntries
	}

	get overflowAria() {
		return this._parent.overflowAria
	}
}
