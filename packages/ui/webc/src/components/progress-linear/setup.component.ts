import { ProgressLinearDescriptor } from '@soxa-ui/setup'
import type { IProgressLinear } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupProgressLinear(
	host: HTMLElement,
	ctrl: IProgressLinear | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IProgressLinear> {
	const adapter = createWebcAdapterContext(host, ProgressLinearDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
