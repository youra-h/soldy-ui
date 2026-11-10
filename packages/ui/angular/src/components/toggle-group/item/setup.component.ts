import {
	ToggleGroupCollectionItemDescriptor,
	ToggleGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import type { IToggleGroupItem, TToggleGroupItemCollectionFacade } from '@soxa-ui/core'
import {
	AngularElevatorFactory,
	createAngularAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding } from '../../../adapter'

export function setupToggleGroupItem(
	ctrl: IToggleGroupItem | undefined,
	props: object,
): TBinding<IToggleGroupItem, TToggleGroupItemCollectionFacade> {
	const adapter = createAngularAdapterContext(ToggleGroupItemDescriptor(), { ctrl, props })
	const owner = useAdapter(adapter)

	const item = createAngularAdapterContext(
		ToggleGroupCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: AngularElevatorFactory })

	return joinBindings(owner, useCollectionAdapter(item))
}
