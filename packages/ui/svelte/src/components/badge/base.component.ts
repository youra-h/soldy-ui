import type { IBadge } from '@soxa-ui/core'
import type { BadgeDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type BadgeEventProps = EventProps<typeof BadgeDescriptor>

export type BadgeProps = UseDomProps<typeof BadgeDescriptor, IBadge, BadgeEventProps>
