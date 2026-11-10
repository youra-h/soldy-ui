import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { ToggleButtonProps } from './base.component'

export function setupToggleButton(
	getProps: () => ToggleButtonProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const adapter = createSvelteAdapterContext(ToggleButtonDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})

	return useAdapter(adapter, getProps, receive)
}
