import {
	TCollectionExtension,
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsDescriptor,
} from '@soxa-ui/setup'
import {
	createSvelteAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
	useElevator,
	type TRootReceiver,
} from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

export function setupBreadcrumbs(
	getProps: () => BreadcrumbsProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const elevator = useElevator()
	const props = getProps()
	const adapter = createSvelteAdapterContext(BreadcrumbsDescriptor(), {
		ctrl: props.ctrl,
		props,
		mountId,
	})

	const collectionAdapter = createSvelteAdapterContext(
		BreadcrumbsCollectionDescriptor(),
		{
			props,
			mountId,
			options: { owner: adapter.instance, engine: props.engine },
		},
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator })

	const collectionBinding = useCollectionAdapter(collectionAdapter, getProps)
	const owner = useAdapter(adapter, getProps, receive)

	return joinBindings(owner, collectionBinding)
}
