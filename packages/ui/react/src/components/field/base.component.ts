import type { IField } from '@soxa-ui/core'
import type { FieldDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type FieldEventProps = EventProps<typeof FieldDescriptor>

export type FieldProps = UseDomProps<typeof FieldDescriptor, IField, FieldEventProps>
