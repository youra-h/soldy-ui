import { AvatarDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { AvatarProps } from './base.component'

export function setupAvatar(getProps: () => AvatarProps, mountId: string, receive: TRootReceiver) {
	const adapter = createSvelteAdapterContext(AvatarDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})

	return useAdapter(adapter, getProps, receive)
}
