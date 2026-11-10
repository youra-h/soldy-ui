import { TSelectionItemFacade } from '../../../../base/collection'
import type { TItemContext } from '../../../../base/collection'
import type {
	TToggleGroupCollectionExtensions,
	TToggleGroupItemCollectionFacadeEvents,
} from '../../collection/types'
import type { IToggleGroupItem } from '../types'
import type { TToggleGroupView } from '../../types'

/** Selection and order are inherited; appearance is read from the group extension. */
export class TToggleGroupItemCollectionFacade extends TSelectionItemFacade<
	IToggleGroupItem,
	TToggleGroupCollectionExtensions,
	TToggleGroupItemCollectionFacadeEvents
> {
	override setContext(
		context: TItemContext<IToggleGroupItem, TToggleGroupCollectionExtensions>,
	): void {
		super.setContext(context)

		if (!this._context) return

		this.events.relayAll(this._context.adapters.toggleGroup.events)
	}

	get view(): TToggleGroupView | undefined {
		return this._context?.adapters.toggleGroup.view
	}
}
