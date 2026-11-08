import { ScrollerDescriptor } from '@soxa-ui/setup'
import type { IScroller } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupScroller(ctrl: IScroller | undefined, props: object): TBinding<IScroller> {
	const adapter = createAngularAdapterContext(ScrollerDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
