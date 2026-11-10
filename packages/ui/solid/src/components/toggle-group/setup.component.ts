import {
	ToggleGroupCollectionDescriptor,
	ToggleGroupDescriptor,
	TCollectionExtension,
} from '@soxa-ui/setup'
import {
	createSolidAdapterContext,
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useElevator,
} from '../../adapter'
import type { ToggleGroupProps } from './base.component'

export function setupToggleGroup(props: ToggleGroupProps) {
	const { elevator, layer } = useElevator()
	const adapter = createSolidAdapterContext(ToggleGroupDescriptor(), {
		ctrl: props.ctrl,
		props,
	})

	const collectionAdapter = createSolidAdapterContext(
		ToggleGroupCollectionDescriptor(),
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
