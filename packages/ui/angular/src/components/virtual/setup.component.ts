import { TVirtualExtension, VirtualDescriptor } from '@soxa-ui/setup'
import type { IVirtual } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Подключение к окну обёртка опускает лифтом коллекциям в содержимом. */
export function setupVirtual(ctrl: IVirtual | undefined, props: object): TBinding<IVirtual> {
	const adapter = createAngularAdapterContext(VirtualDescriptor(), { ctrl, props }).use(
		TVirtualExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
