import { BadgeDescriptor } from '@soxa-ui/setup'
import type { IBadge } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupBadge(ctrl: IBadge | undefined, props: object): TBinding<IBadge> {
	const adapter = createAngularAdapterContext(BadgeDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
