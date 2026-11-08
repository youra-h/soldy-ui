import {
	TCollectionExtension,
	TToastsApiExtension,
	ToastsCollectionDescriptor,
	ToastsDescriptor,
} from '@soxa-ui/setup'
import type { IToasts, TToastsCollectionFacade } from '@soxa-ui/core'
import {
	createWebcAdapterContext,
	joinBindings,
	useAdapter,
	useCollectionAdapter,
} from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

export function setupToasts(
	host: HTMLElement,
	ctrl: IToasts | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IToasts, TToastsCollectionFacade> {
	const adapter = createWebcAdapterContext(host, ToastsDescriptor(), { ctrl, props })
	const elevator = createWebcElevator(host)

	const collectionAdapter = createWebcAdapterContext(
		host,
		ToastsCollectionDescriptor(),
		{ props, options: { owner: adapter.instance, engine: props['engine'] } },
		{ bundle: adapter.bundle },
	)
		.use(TCollectionExtension, { elevator })
		.use(TToastsApiExtension, { elevator })

	const facade = useCollectionAdapter(collectionAdapter, host, onUpdate)
	const owner = useAdapter(adapter, host, onUpdate)

	return joinBindings(owner, facade)
}
