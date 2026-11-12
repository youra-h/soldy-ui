import { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { IAlertDialog } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupAlertDialog(
	ctrl: IAlertDialog | undefined,
	props: object,
): TBinding<IAlertDialog> {
	const adapter = createAngularAdapterContext(AlertDialogDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
