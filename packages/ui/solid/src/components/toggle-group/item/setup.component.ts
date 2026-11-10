import {
	ToggleGroupCollectionItemDescriptor,
	ToggleGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import {
	createSolidAdapterContext,
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useElevator,
} from '../../../adapter'
import type { ToggleGroupItemProps } from './base.component'

export function setupToggleGroupItem(props: ToggleGroupItemProps) {
	const { elevator } = useElevator()
	const adapter = createSolidAdapterContext(ToggleGroupItemDescriptor(), {
		ctrl: props.ctrl,
		props,
	})

	const item = createSolidAdapterContext(
		ToggleGroupCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator })

	const itemBinding = useCollectionAdapter(item, props)
	const owner = useAdapter(adapter, props)

	return { ...joinBindings(owner, itemBinding), context: item.instance.context }
}
