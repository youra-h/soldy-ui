import type { IVirtual } from '@soxa-ui/core'
import type { VirtualDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type VirtualEventProps = EventProps<typeof VirtualDescriptor>

/** Без атрибутов и `ref`: своего узла у обёртки нет. */
export type VirtualProps = UseProps<typeof VirtualDescriptor, IVirtual, VirtualEventProps>
