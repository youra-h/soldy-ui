import { MenuSeparatorDescriptor } from '@soxa-ui/setup'
import type { TMenuSeparator } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding } from '../../../adapter'

export function setupMenuSeparator(
	ctrl: TMenuSeparator | undefined,
	props: object,
): TBinding<TMenuSeparator> {
	const adapter = createAngularAdapterContext(MenuSeparatorDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
