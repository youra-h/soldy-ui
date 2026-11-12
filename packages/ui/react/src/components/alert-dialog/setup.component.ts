import { AlertDialogDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { AlertDialogProps } from './base.component'

export function useSetupAlertDialog(props: AlertDialogProps) {
	return useComponent(
		(create) => create(AlertDialogDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
