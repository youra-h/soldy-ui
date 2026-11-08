import { IconDescriptor } from '@soxa-ui/setup'
import type { IIcon } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupIcon(ctrl: IIcon | undefined, props: object): TBinding<IIcon> {
	const adapter = createAngularAdapterContext(IconDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
