import { TSelectionCollectionFacade } from '../../../../base/collection'
import type { TCollectionFacadeOptions, TSelectionFacadeProps } from '../../../../base/collection'
import type { TToggleGroupView } from '../../types'
import { toggleGroupExtensions } from '../factory'
import { completeEngine } from '../../../../base/collection/create/internal'
import type {
	TToggleGroupCollection,
	TToggleGroupCollectionExtensions,
	TToggleGroupCollectionFacadeEngine,
} from '../types'
import type { TToggleGroupCollectionFacadeEvents } from '../types'
import type { IToggleGroupItem } from '../../item/types'
import type { IToggleGroup } from '../../types'

/** Completes an external engine in place and exposes the shared selection facade. */
export class TToggleGroupCollectionFacade extends TSelectionCollectionFacade<
	IToggleGroupItem,
	TToggleGroupCollectionExtensions,
	TToggleGroupCollectionFacadeEvents
> {
	constructor(
		props: TSelectionFacadeProps<IToggleGroupItem> = {},
		options: TCollectionFacadeOptions<TToggleGroupCollectionFacadeEngine, IToggleGroup> = {},
	) {
		super(
			{},
			{
				engine: completeEngine(
					options.engine,
					toggleGroupExtensions(),
				) as TToggleGroupCollection,
				owner: options.owner,
			},
		)

		if (!options.engine) this.bindOwner()

		this.events.relayAll(this.extensions.toggleGroup.events)

		this.applyProps(props)
	}

	get view(): TToggleGroupView | undefined {
		return this.extensions.toggleGroup.view
	}
}
