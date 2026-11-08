import { InteractiveDescriptor } from '@soxa-ui/setup'
import type { IInteractive } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupInteractive(
	host: HTMLElement,
	ctrl: IInteractive | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IInteractive> {
	const adapter = createWebcAdapterContext(host, InteractiveDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
