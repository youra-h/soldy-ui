import { ComponentDescriptor } from '@soxa-ui/setup'
import type { IComponent } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupComponent(ctrl: IComponent | undefined, props: object): TBinding<IComponent> {
	const adapter = createAngularAdapterContext(ComponentDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
