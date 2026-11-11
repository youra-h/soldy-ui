import { withParts } from '@soxa-ui/setup'
import AvatarComponent from './Avatar.svelte'
import { AvatarGroup } from './group'
export * from './base.component'
export * from './group'
export const Avatar = withParts(AvatarComponent, { Group: AvatarGroup })
