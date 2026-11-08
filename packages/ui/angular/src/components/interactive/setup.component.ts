import { InteractiveDescriptor } from '@soxa-ui/setup'
import type { IInteractive } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Своего компонента у слоя нет: на нём стоят Slider, Rating, Scroller и Pagination. */
export function setupInteractive(
	ctrl: IInteractive | undefined,
	props: object,
): TBinding<IInteractive> {
	const adapter = createAngularAdapterContext(InteractiveDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}
