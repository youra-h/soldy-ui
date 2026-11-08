import {
	RadioGroupCollectionItemDescriptor,
	RadioGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import type { IRadioGroupItem, TRadioGroupItemCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding, TUpdateListener } from '../../../adapter'
import { createWebcElevator } from '../../../adapter/elevator'

export function setupRadioGroupItem(
	host: HTMLElement,
	ctrl: IRadioGroupItem | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IRadioGroupItem, TRadioGroupItemCollectionFacade> {
	const adapter = createWebcAdapterContext(host, RadioGroupItemDescriptor(), { ctrl, props })

	const itemAdapter = createWebcAdapterContext(
		host,
		RadioGroupCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: createWebcElevator(host) })

	// Фасад первым: запись группы при входе радио своя связка прочтёт сразу
	const item = useCollectionAdapter(itemAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, item)
}
