import {
	TCollectionItemExtension,
	BreadcrumbsCollectionItemDescriptor,
	BreadcrumbsItemDescriptor,
} from '@soxa-ui/setup'
import type { IBreadcrumbsItem, TBreadcrumbsItemCollectionFacade } from '@soxa-ui/core'
import {
	AngularElevatorFactory,
	createAngularAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding } from '../../../adapter'

export function setupBreadcrumbsItem(
	ctrl: IBreadcrumbsItem | undefined,
	props: object,
): TBinding<IBreadcrumbsItem, TBreadcrumbsItemCollectionFacade> {
	const adapter = createAngularAdapterContext(BreadcrumbsItemDescriptor(), { ctrl, props })
	const owner = useAdapter(adapter)

	const item = createAngularAdapterContext(
		BreadcrumbsCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: AngularElevatorFactory })

	return joinBindings(owner, useCollectionAdapter(item))
}
