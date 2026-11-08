import { ProgressSpinnerDescriptor } from '@soxa-ui/setup'
import type { IProgressSpinner } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupProgressSpinner(
	host: HTMLElement,
	ctrl: IProgressSpinner | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IProgressSpinner> {
	const adapter = createWebcAdapterContext(host, ProgressSpinnerDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
