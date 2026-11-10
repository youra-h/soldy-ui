import type { TAria } from '../../../../../../common'
import type { IExtension, IExtensionItems } from '../../../../../base/collection'
import type { IBreadcrumbsItem } from '../../../item/types'
import type { IMenu, IMenuItem } from '../../../../menu'
import type { IBreadcrumbsItemExtension } from './item'

export type TBreadcrumbsOverflowEntry<TItem extends IBreadcrumbsItem = IBreadcrumbsItem> = {
	readonly item: TItem
	readonly menuItem: IMenuItem
}

export type TBreadcrumbsExtensionEvents = {
	'change:window': () => void
	'change:overflowAria': () => void
}

export interface IBreadcrumbsExtension<TItem extends IBreadcrumbsItem = IBreadcrumbsItem>
	extends
		IExtension<TItem, TBreadcrumbsExtensionEvents>,
		IExtensionItems<TItem, IBreadcrumbsItemExtension<TItem>> {
	readonly menu: IMenu
	readonly overflowEntries: readonly TBreadcrumbsOverflowEntry<TItem>[]
	readonly overflowAria: TAria | undefined
	readonly firstItem: TItem | undefined
	isCollapsed(item: TItem): boolean
}
