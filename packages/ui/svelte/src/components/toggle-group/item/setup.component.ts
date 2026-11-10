import {
	ToggleGroupCollectionItemDescriptor,
	ToggleGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import {
	createSvelteAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
	useElevator,
	type TRootReceiver,
} from '../../../adapter'
import type { ToggleGroupItemProps } from './base.component'

export function setupToggleGroupItem(
	getProps: () => ToggleGroupItemProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const elevator = useElevator()
	const props = getProps()
	const adapter = createSvelteAdapterContext(ToggleGroupItemDescriptor(), {
		ctrl: props.ctrl,
		props,
		mountId,
	})

	const item = createSvelteAdapterContext(
		ToggleGroupCollectionItemDescriptor(),
		{ props, mountId },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator })

	const itemBinding = useCollectionAdapter(item, getProps)
	const owner = useAdapter(adapter, getProps, receive)

	return Object.assign(joinBindings(owner, itemBinding), { context: item.instance.context })
}
