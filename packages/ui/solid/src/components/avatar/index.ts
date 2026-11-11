import { withParts } from '@soxa-ui/setup'
import { Avatar as AvatarComponent } from './Avatar'
import { AvatarGroup } from './group'
export * from './base.component'
export * from './group'
export const Avatar = withParts(AvatarComponent, { Group: AvatarGroup })
