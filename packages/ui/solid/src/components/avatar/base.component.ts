import type { IAvatar } from '@soxa-ui/core'
import type { AvatarDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AvatarEventProps = EventProps<typeof AvatarDescriptor>

export type AvatarProps = UseDomProps<typeof AvatarDescriptor, IAvatar, AvatarEventProps>
