import type { IAvatarGroup } from '@soxa-ui/core'
import type { AvatarGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type AvatarGroupEventProps = EventProps<typeof AvatarGroupDescriptor>

export type AvatarGroupProps = UseDomProps<
	typeof AvatarGroupDescriptor,
	IAvatarGroup,
	AvatarGroupEventProps
>
