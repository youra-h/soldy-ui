import {
	RadioGroupCollectionItemDescriptor,
	RadioGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import type { IRadioGroupItem, TRadioGroupItemCollectionFacade } from '@soxa-ui/core'
import {
	AngularElevatorFactory,
	createAngularAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding } from '../../../adapter'

export function setupRadioGroupItem(
	ctrl: IRadioGroupItem | undefined,
	props: object,
): TBinding<IRadioGroupItem, TRadioGroupItemCollectionFacade> {
	const adapter = createAngularAdapterContext(RadioGroupItemDescriptor(), { ctrl, props })
	const owner = useAdapter(adapter)

	const item = createAngularAdapterContext(
		RadioGroupCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: AngularElevatorFactory })

	return joinBindings(owner, useCollectionAdapter(item))
}
