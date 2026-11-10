import {
	ToggleGroupCollectionDescriptor,
	ToggleGroupDescriptor,
	TCollectionExtension,
} from '@soxa-ui/setup'
import type { IToggleGroup, TToggleGroupCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

export function setupToggleGroup(
	host: HTMLElement,
	ctrl: IToggleGroup | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IToggleGroup, TToggleGroupCollectionFacade> {
	const adapter = createWebcAdapterContext(host, ToggleGroupDescriptor(), {
		ctrl,
		props,
	})

	const collectionAdapter = createWebcAdapterContext(
		host,
		ToggleGroupCollectionDescriptor(),
		{ props, options: { owner: adapter.instance, engine: props['engine'] } },
		{ bundle: adapter.bundle },
	).use(TCollectionExtension, { elevator: createWebcElevator(host) })

	const facade = useCollectionAdapter(collectionAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, facade)
}
