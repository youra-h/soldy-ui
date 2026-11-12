import { AlertDialogDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { AlertDialogProps } from './base.component'

export function setupAlertDialog(props: AlertDialogProps) {
	const adapter = createSolidAdapterContext(AlertDialogDescriptor(), { ctrl: props.ctrl, props })

	return useAdapter(adapter, props)
}
