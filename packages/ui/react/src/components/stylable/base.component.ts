import type { IStylable } from '@soxa-ui/core'
import type { StylableDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type StylableEventProps = EventProps<typeof StylableDescriptor>

export type StylableProps = UseProps<typeof StylableDescriptor, IStylable, StylableEventProps>
