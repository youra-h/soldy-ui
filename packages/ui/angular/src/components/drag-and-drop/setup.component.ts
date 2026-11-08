import { DragAndDropDescriptor, TDragAndDropExtension } from '@soxa-ui/setup'
import type { IDragAndDrop } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Свой экземпляр обёртка опускает лифтом коллекциям в содержимом. */
export function setupDragAndDrop(
	ctrl: IDragAndDrop | undefined,
	props: object,
): TBinding<IDragAndDrop> {
	const adapter = createAngularAdapterContext(DragAndDropDescriptor(), { ctrl, props }).use(
		TDragAndDropExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
