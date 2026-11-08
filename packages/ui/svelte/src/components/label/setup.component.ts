import { LabelDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { LabelProps } from './base.component'

export function setupLabel(getProps: () => LabelProps, mountId: string, receive: TRootReceiver) {
	const adapter = createSvelteAdapterContext(LabelDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})

	return useAdapter(adapter, getProps, receive)
}
