import {
	ToggleGroupCollectionDescriptor,
	ToggleGroupDescriptor,
	TCollectionExtension,
} from '@soxa-ui/setup'
import type { IToggleGroup, IToggleGroupProps, TToggleGroupCollectionFacade } from '@soxa-ui/core'
import {
	AngularElevatorFactory,
	createAngularAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupToggleGroup(
	ctrl: IToggleGroup | undefined,
	props: object,
	engine: IToggleGroupProps['engine'],
): TBinding<IToggleGroup, TToggleGroupCollectionFacade> {
	const adapter = createAngularAdapterContext(ToggleGroupDescriptor(), { ctrl, props })
	const owner = useAdapter(adapter)

	const collectionAdapter = createAngularAdapterContext(
		ToggleGroupCollectionDescriptor(),
		{ props, options: { owner: adapter.instance, engine } },
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator: AngularElevatorFactory })

	return joinBindings(owner, useCollectionAdapter(collectionAdapter))
}
