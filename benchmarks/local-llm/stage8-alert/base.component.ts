import type { AlertDescriptor, TAlert, UseDomProps, EventProps } from './api'

export type AlertProps = UseDomProps<typeof AlertDescriptor, TAlert, EventProps<typeof AlertDescriptor>>
