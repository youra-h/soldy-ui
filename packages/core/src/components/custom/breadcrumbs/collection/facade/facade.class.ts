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

/**
 * Complete and expose a breadcrumb engine through the standard activation facade.
 * An external engine remains caller-owned and can be rebound by a later mounting.
 */
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

		// The mounted adapter scopes owner binding for external engines to its own lifetime.
		if (!options.engine) this.bindOwner()

		this.events.relayAll(this.extensions.breadcrumbs.events)

		this.applyProps(props)
	}
}
