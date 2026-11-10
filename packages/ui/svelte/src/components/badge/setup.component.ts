import { BadgeDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { BadgeProps } from './base.component'

export function setupBadge(getProps: () => BadgeProps, mountId: string, receive: TRootReceiver) {
	const adapter = createSvelteAdapterContext(BadgeDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})

	return useAdapter(adapter, getProps, receive)
}
