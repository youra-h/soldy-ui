import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { DragAndDropDescriptor } from '@soxa-ui/setup'
import type { IDragAndDrop } from '@soxa-ui/core'

export const emitsDragAndDrop: TEmits = useEmits(DragAndDropDescriptor())

export const propsDragAndDrop: TProps = useProps(DragAndDropDescriptor()) as TProps

export type DragAndDropProps = UseProps<typeof DragAndDropDescriptor, IDragAndDrop>

export default {
	name: 'BaseDragAndDrop',
	emits: emitsDragAndDrop,
	props: propsDragAndDrop,
}
