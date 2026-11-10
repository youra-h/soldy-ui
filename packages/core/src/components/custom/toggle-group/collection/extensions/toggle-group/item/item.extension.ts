import { TBaseItemExtension } from '../../../../../../base/collection'
import type { IToggleGroupItemExtension, TToggleGroupItemEventsExtension } from './types'
import type { IToggleGroupItem } from '../../../../item/types'
import type { IToggleGroupExtension } from '../types'
import type { TToggleGroupView } from '../../../../types'

export class TToggleGroupItemExtension<
	TItem extends IToggleGroupItem = IToggleGroupItem,
	TParent extends IToggleGroupExtension<TItem> = IToggleGroupExtension<TItem>,
>
	extends TBaseItemExtension<TItem, TParent, TToggleGroupItemEventsExtension>
	implements IToggleGroupItemExtension<TItem>
{
	constructor(item: TItem, parent: TParent) {
		super(item, parent)

		this.events.relay(parent.events, ['change:view'])
	}

	get view(): TToggleGroupView | undefined {
		return this._parent.view
	}
}
