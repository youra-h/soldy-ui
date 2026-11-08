import { MenuSeparatorDescriptor } from '@soxa-ui/setup'
import type { TMenuSeparator } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding, TUpdateListener } from '../../../adapter'

export function setupMenuSeparator(
	host: HTMLElement,
	ctrl: TMenuSeparator | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<TMenuSeparator> {
	const adapter = createWebcAdapterContext(host, MenuSeparatorDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
