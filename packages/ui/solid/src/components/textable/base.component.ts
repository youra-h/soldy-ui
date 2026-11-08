import type { ITextable } from '@soxa-ui/core'
import type { TextableDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

/** События слоя Textable (core + плагины), выведены из дескриптора автоматически. */
export type TextableEventProps = EventProps<typeof TextableDescriptor>

export type TextableProps = UseProps<typeof TextableDescriptor, ITextable, TextableEventProps>
