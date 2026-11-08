import { ProgressSpinnerDescriptor } from '@soxa-ui/setup'
import type { IProgressSpinner } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupProgressSpinner(
	ctrl: IProgressSpinner | undefined,
	props: object,
): TBinding<IProgressSpinner> {
	const adapter = createAngularAdapterContext(ProgressSpinnerDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
