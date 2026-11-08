import type { IField } from '@soxa-ui/core'
import type { FieldDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События слоя Field (core + плагины), выведены из дескриптора автоматически. */
export type FieldEventProps = EventProps<typeof FieldDescriptor>

export type FieldProps = UseDomProps<typeof FieldDescriptor, IField, FieldEventProps>
