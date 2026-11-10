import {
	TCollectionExtension,
	ToggleGroupDescriptor,
	ToggleGroupCollectionDescriptor,
} from '@soxa-ui/setup'
import {
	useAdapter,
	joinBindings,
	useExpose,
	useCollectionAdapter,
	VueElevatorFactory,
	createVueAdapterContext,
	type SetupContext,
} from '../../adapter'
import BaseToggleGroup, { type ToggleGroupProps } from './base.component'

export default {
	name: '_ToggleGroup',
	extends: BaseToggleGroup,
	expose: useExpose(),
	setup(props: ToggleGroupProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(ToggleGroupDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		const collectionAdapter = createVueAdapterContext(
			ToggleGroupCollectionDescriptor(),
			{
				props,

				options: { owner: adapter.instance, engine: props.engine },
			},
			{ bundle: adapter.bundle },
		).use(TCollectionExtension, { elevator: VueElevatorFactory })

		const refsCollection = useCollectionAdapter(collectionAdapter, props, emit)
		const refs = useAdapter(adapter, props, emit)

		return joinBindings(refs, refsCollection)
	},
}
