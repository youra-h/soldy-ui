import { DrawerDescriptor } from '@soxa-ui/setup'
import type { IDrawer } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupDrawer(ctrl: IDrawer | undefined, props: object): TBinding<IDrawer> {
	const adapter = createAngularAdapterContext(DrawerDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
