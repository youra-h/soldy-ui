import type { ITextable } from '@soxa-ui/core'
import type { TextableDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type TextableEventProps = EventProps<typeof TextableDescriptor>

export type TextableProps = UseProps<typeof TextableDescriptor, ITextable, TextableEventProps>
