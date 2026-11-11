import { AlertDescriptor } from '@soxa-ui/setup'
import type { IAlert } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupAlert(
	host: HTMLElement,
	ctrl: IAlert | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IAlert> {
	const adapter = createWebcAdapterContext(host, AlertDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
