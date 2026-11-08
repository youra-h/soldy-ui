import type { IVirtual } from '@soxa-ui/core'
import type { VirtualDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type VirtualEventProps = EventProps<typeof VirtualDescriptor>

/** Пропсы Virtual — без атрибутов DOM: своего узла у обёртки нет. */
export type VirtualProps = UseProps<typeof VirtualDescriptor, IVirtual, VirtualEventProps>
