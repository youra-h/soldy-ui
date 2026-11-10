import {
	TCollectionExtension,
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsDescriptor,
} from '@soxa-ui/setup'
import type { IBreadcrumbs, IBreadcrumbsProps, TBreadcrumbsCollectionFacade } from '@soxa-ui/core'
import {
	AngularElevatorFactory,
	createAngularAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupBreadcrumbs(
	ctrl: IBreadcrumbs | undefined,
	props: object,
	engine: IBreadcrumbsProps['engine'],
): TBinding<IBreadcrumbs, TBreadcrumbsCollectionFacade> {
	const adapter = createAngularAdapterContext(BreadcrumbsDescriptor(), { ctrl, props })
	const owner = useAdapter(adapter)

	const collectionAdapter = createAngularAdapterContext(
		BreadcrumbsCollectionDescriptor(),
		{ props, options: { owner: adapter.instance, engine } },
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator: AngularElevatorFactory })

	return joinBindings(owner, useCollectionAdapter(collectionAdapter))
}
