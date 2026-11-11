import type { IAlert } from '@soxa-ui/core'
import type { AlertDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AlertEventProps = EventProps<typeof AlertDescriptor>

export type AlertProps = UseDomProps<typeof AlertDescriptor, IAlert, AlertEventProps>
