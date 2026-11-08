import { DragAndDropDescriptor, TDragAndDropExtension } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { DragAndDropProps } from './base.component'

export function useSetupDragAndDrop(props: DragAndDropProps) {
	return useComponent(
		(create, elevator) =>
			create(DragAndDropDescriptor(), { ctrl: props.ctrl, props }).use(
				TDragAndDropExtension,
				{ elevator },
			),
		props,
	)
}
