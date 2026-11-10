import {
	TCollectionItemExtension,
	BreadcrumbsCollectionItemDescriptor,
	BreadcrumbsItemDescriptor,
} from '@soxa-ui/setup'
import {
	createSvelteAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
	useElevator,
	type TRootReceiver,
} from '../../../adapter'
import type { BreadcrumbsItemProps } from './base.component'

export function setupBreadcrumbsItem(
	getProps: () => BreadcrumbsItemProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const elevator = useElevator()
	const props = getProps()
	const adapter = createSvelteAdapterContext(BreadcrumbsItemDescriptor(), {
		ctrl: props.ctrl,
		props,
		mountId,
	})

	const item = createSvelteAdapterContext(
		BreadcrumbsCollectionItemDescriptor(),
		{ props, mountId },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator })

	const itemBinding = useCollectionAdapter(item, getProps)
	const owner = useAdapter(adapter, getProps, receive)

	return Object.assign(joinBindings(owner, itemBinding), { context: item.instance.context })
}
