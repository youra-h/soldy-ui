import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import type { IAvatarGroup } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding } from '../../../adapter'

export function setupAvatarGroup(
	ctrl: IAvatarGroup | undefined,
	props: object,
): TBinding<IAvatarGroup> {
	const adapter = createAngularAdapterContext(AvatarGroupDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
