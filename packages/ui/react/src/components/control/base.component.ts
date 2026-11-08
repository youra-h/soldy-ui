import type { IControl } from '@soxa-ui/core'
import type { ControlDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type ControlEventProps = EventProps<typeof ControlDescriptor>

export type ControlProps = UseProps<typeof ControlDescriptor, IControl, ControlEventProps>
