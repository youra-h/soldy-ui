import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import type { IToggleButton } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupToggleButton(
	host: HTMLElement,
	ctrl: IToggleButton | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IToggleButton> {
	const adapter = createWebcAdapterContext(host, ToggleButtonDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
