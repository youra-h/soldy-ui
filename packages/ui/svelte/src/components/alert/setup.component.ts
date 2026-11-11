import { AlertDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { AlertProps } from './base.component'

export function setupAlert(getProps: () => AlertProps, mountId: string, receive: TRootReceiver) {
	const adapter = createSvelteAdapterContext(AlertDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})

	return useAdapter(adapter, getProps, receive)
}
