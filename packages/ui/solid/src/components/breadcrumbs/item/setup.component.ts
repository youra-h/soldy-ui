import {
	TCollectionItemExtension,
	BreadcrumbsCollectionItemDescriptor,
	BreadcrumbsItemDescriptor,
} from '@soxa-ui/setup'
import {
	createSolidAdapterContext,
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useElevator,
} from '../../../adapter'
import type { BreadcrumbsItemProps } from './base.component'

export function setupBreadcrumbsItem(props: BreadcrumbsItemProps) {
	const { elevator } = useElevator()
	const adapter = createSolidAdapterContext(BreadcrumbsItemDescriptor(), {
		ctrl: props.ctrl,
		props,
	})

	const item = createSolidAdapterContext(
		BreadcrumbsCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator })

	const itemBinding = useCollectionAdapter(item, props)
	const owner = useAdapter(adapter, props)

	return { ...joinBindings(owner, itemBinding), context: item.instance.context }
}
