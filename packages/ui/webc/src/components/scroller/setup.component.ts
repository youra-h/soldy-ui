import { ScrollerDescriptor } from '@soxa-ui/setup'
import type { IScroller } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupScroller(
	host: HTMLElement,
	ctrl: IScroller | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IScroller> {
	const adapter = createWebcAdapterContext(host, ScrollerDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
