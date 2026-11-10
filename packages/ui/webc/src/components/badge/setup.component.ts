import { BadgeDescriptor } from '@soxa-ui/setup'
import type { IBadge } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupBadge(
	host: HTMLElement,
	ctrl: IBadge | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IBadge> {
	const adapter = createWebcAdapterContext(host, BadgeDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
