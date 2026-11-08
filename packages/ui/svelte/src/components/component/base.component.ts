import type { IComponent } from '@soxa-ui/core'
import type { ComponentDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type ComponentEventProps = EventProps<typeof ComponentDescriptor>

export type ComponentProps = UseProps<typeof ComponentDescriptor, IComponent, ComponentEventProps>
