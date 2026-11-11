import { AlertDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { AlertProps } from './base.component'

export function setupAlert(props: AlertProps) {
	const adapter = createSolidAdapterContext(AlertDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
