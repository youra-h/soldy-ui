import {
	TCollectionExtension,
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsDescriptor,
} from '@soxa-ui/setup'
import {
	createSolidAdapterContext,
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useElevator,
} from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

/** Share one bundle between the landmark model and the standard collection facade. */
export function setupBreadcrumbs(props: BreadcrumbsProps) {
	const { elevator, layer } = useElevator()
	const adapter = createSolidAdapterContext(BreadcrumbsDescriptor(), { ctrl: props.ctrl, props })

	const collectionAdapter = createSolidAdapterContext(
		BreadcrumbsCollectionDescriptor(),
		{
			props,
			options: { owner: adapter.instance, engine: props.engine },
		},
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator })

	const collectionBinding = useCollectionAdapter(collectionAdapter, props)
	const owner = useAdapter(adapter, props)

	return { ...joinBindings(owner, collectionBinding), layer }
}
