import type { IControl } from '@soxa-ui/core'
import type { ControlDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

/** События слоя Control (core + плагины), выведены из дескриптора автоматически. */
export type ControlEventProps = EventProps<typeof ControlDescriptor>

export type ControlProps = UseProps<typeof ControlDescriptor, IControl, ControlEventProps>
