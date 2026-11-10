import {
	TCollectionItemExtension,
	BreadcrumbsCollectionItemDescriptor,
	BreadcrumbsItemDescriptor,
} from '@soxa-ui/setup'
import type { IBreadcrumbsItem, TBreadcrumbsItemCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding, TUpdateListener } from '../../../adapter'
import { createWebcElevator } from '../../../adapter/elevator'

export function setupBreadcrumbsItem(
	host: HTMLElement,
	ctrl: IBreadcrumbsItem | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IBreadcrumbsItem, TBreadcrumbsItemCollectionFacade> {
	const adapter = createWebcAdapterContext(host, BreadcrumbsItemDescriptor(), { ctrl, props })

	const itemAdapter = createWebcAdapterContext(
		host,
		BreadcrumbsCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: createWebcElevator(host) })

	const item = useCollectionAdapter(itemAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, item)
}
