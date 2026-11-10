import { BadgeDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { BadgeProps } from './base.component'

export function setupBadge(props: BadgeProps) {
	const adapter = createSolidAdapterContext(BadgeDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
