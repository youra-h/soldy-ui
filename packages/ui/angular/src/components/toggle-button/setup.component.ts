import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import type { IToggleButton } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupToggleButton(
	ctrl: IToggleButton | undefined,
	props: object,
): TBinding<IToggleButton> {
	const adapter = createAngularAdapterContext(ToggleButtonDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
