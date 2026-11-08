import { ButtonDescriptor } from '@soxa-ui/setup'
import type { IButton } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupButton(
	host: HTMLElement,
	ctrl: IButton | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IButton> {
	const adapter = createWebcAdapterContext(host, ButtonDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
