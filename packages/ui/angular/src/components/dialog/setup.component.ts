import { DialogDescriptor } from '@soxa-ui/setup'
import type { IDialog } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupDialog(ctrl: IDialog | undefined, props: object): TBinding<IDialog> {
	const adapter = createAngularAdapterContext(DialogDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
