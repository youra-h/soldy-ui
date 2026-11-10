import type { IItemExtension, TBaseItemEventsExtension } from '../../../../../../base/collection'
import type { IBreadcrumbsItem } from '../../../../item/types'
import type { IMenu } from '../../../../../menu'
import type { TAria } from '../../../../../../../common'
import type { TBreadcrumbsOverflowEntry } from '../types'

export type TBreadcrumbsItemExtensionEvents = TBaseItemEventsExtension & {
	'change:window': () => void
	'change:overflowAria': () => void
}

export interface IBreadcrumbsItemExtension<
	TItem extends IBreadcrumbsItem = IBreadcrumbsItem,
> extends IItemExtension<TItem, TBreadcrumbsItemExtensionEvents> {
	readonly separator: boolean
	/** False hides this breadcrumb position without changing the source item's visible property. */
	readonly shown: boolean
	/** Only the first drawn item hosts the menu, placing its trigger immediately after that item. */
	readonly menu: IMenu | null
	readonly overflowEntries: readonly TBreadcrumbsOverflowEntry<TItem>[]
	readonly overflowAria: TAria | undefined
}
