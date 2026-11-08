import { ProgressLinearDescriptor } from '@soxa-ui/setup'
import type { IProgressLinear } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupProgressLinear(
	ctrl: IProgressLinear | undefined,
	props: object,
): TBinding<IProgressLinear> {
	const adapter = createAngularAdapterContext(ProgressLinearDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
