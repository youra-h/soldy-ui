import { AvatarDescriptor } from '@soxa-ui/setup'
import type { IAvatar } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupAvatar(ctrl: IAvatar | undefined, props: object): TBinding<IAvatar> {
	const adapter = createAngularAdapterContext(AvatarDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
