import type { IDragAndDrop } from '@soxa-ui/core'
import type { DragAndDropDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type DragAndDropEventProps = EventProps<typeof DragAndDropDescriptor>

/** Пропсы DragAndDrop — без атрибутов DOM: своего узла у обёртки нет. */
export type DragAndDropProps = UseProps<
	typeof DragAndDropDescriptor,
	IDragAndDrop,
	DragAndDropEventProps
>
