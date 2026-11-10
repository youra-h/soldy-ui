import {
	ToggleGroupCollectionItemDescriptor,
	ToggleGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import type { IToggleGroupItem, TToggleGroupItemCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../../adapter'
import type { TBinding, TUpdateListener } from '../../../adapter'
import { createWebcElevator } from '../../../adapter/elevator'

export function setupToggleGroupItem(
	host: HTMLElement,
	ctrl: IToggleGroupItem | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IToggleGroupItem, TToggleGroupItemCollectionFacade> {
	const adapter = createWebcAdapterContext(host, ToggleGroupItemDescriptor(), { ctrl, props })

	const itemAdapter = createWebcAdapterContext(
		host,
		ToggleGroupCollectionItemDescriptor(),
		{ props },
		{ bundle: adapter.bundle },
	).use(TCollectionItemExtension, { adapter, elevator: createWebcElevator(host) })

	const item = useCollectionAdapter(itemAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, item)
}
