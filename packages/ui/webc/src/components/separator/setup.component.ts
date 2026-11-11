import { SeparatorDescriptor } from '@soxa-ui/setup'
import type { ISeparator } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupSeparator(
	host: HTMLElement,
	ctrl: ISeparator | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ISeparator> {
	const adapter = createWebcAdapterContext(host, SeparatorDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
