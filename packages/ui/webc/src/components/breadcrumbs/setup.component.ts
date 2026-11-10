import {
	TCollectionExtension,
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsDescriptor,
} from '@soxa-ui/setup'
import type { IBreadcrumbs, TBreadcrumbsCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Share one bundle between the landmark model and the standard collection facade. */
export function setupBreadcrumbs(
	host: HTMLElement,
	ctrl: IBreadcrumbs | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IBreadcrumbs, TBreadcrumbsCollectionFacade> {
	const adapter = createWebcAdapterContext(host, BreadcrumbsDescriptor(), { ctrl, props })
	const elevator = createWebcElevator(host)

	const collectionAdapter = createWebcAdapterContext(
		host,
		BreadcrumbsCollectionDescriptor(),
		{
			props,
			options: { owner: adapter.instance, engine: props['engine'] },
		},
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator })

	const facade = useCollectionAdapter(collectionAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, facade)
}
