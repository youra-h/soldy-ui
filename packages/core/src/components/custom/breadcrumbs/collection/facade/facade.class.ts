import { TActivationCollectionFacade } from '../../../../base/collection'
import type {
	TCollectionEngine,
	TCollectionFacadeOptions,
	TCollectionFacadeProps,
} from '../../../../base/collection'
import { completeEngine } from '../../../../base/collection/create/internal'
import { breadcrumbsExtensions } from '../factory'
import type {
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsCollectionFacadeEngine,
	TBreadcrumbsCollectionFacadeEvents,
} from '../types'
import type { IBreadcrumbsItem } from '../../item/types'
import type { IBreadcrumbs } from '../../types'

export class TBreadcrumbsCollectionFacade extends TActivationCollectionFacade<
	IBreadcrumbsItem,
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsCollectionFacadeEvents
> {
	constructor(
		props: TCollectionFacadeProps<IBreadcrumbsItem> = {},
		options: TCollectionFacadeOptions<TBreadcrumbsCollectionFacadeEngine, IBreadcrumbs> = {},
	) {
		super(
			{},
			{
				engine: completeEngine(
					options.engine,
					breadcrumbsExtensions(),
				) as TCollectionEngine<IBreadcrumbsItem, TBreadcrumbsCollectionExtensions>,
				owner: options.owner,
			},
		)
		if (!options.engine) this.bindOwner()

		this.events.relayAll(this.extensions.breadcrumbs.events)

		this.applyProps(props)
	}
}
