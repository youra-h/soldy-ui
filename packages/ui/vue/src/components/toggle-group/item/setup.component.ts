import {
	TCollectionItemExtension,
	ToggleGroupItemDescriptor,
	ToggleGroupCollectionItemDescriptor,
} from '@soxa-ui/setup'
import {
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useExpose,
	VueElevatorFactory,
	createVueAdapterContext,
	type SetupContext,
} from '../../../adapter'
import BaseToggleGroupItem, { type ToggleGroupItemProps } from './base.component'

export default {
	name: '_ToggleGroupItem',
	extends: BaseToggleGroupItem,
	expose: useExpose(),
	setup(props: ToggleGroupItemProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(ToggleGroupItemDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		const itemAdapter = createVueAdapterContext(
			ToggleGroupCollectionItemDescriptor(),
			{ props },
			{ bundle: adapter.bundle },
		).use(TCollectionItemExtension, { adapter, elevator: VueElevatorFactory })

		const itemBinding = useCollectionAdapter(itemAdapter, props, emit)
		const ownerBinding = useAdapter(adapter, props, emit)

		return joinBindings(ownerBinding, itemBinding)
	},
}
