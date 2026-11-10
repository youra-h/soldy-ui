import { BadgeDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { BadgeProps } from './base.component'

export function useSetupBadge(props: BadgeProps) {
	return useComponent((create) => create(BadgeDescriptor(), { ctrl: props.ctrl, props }), props)
}
