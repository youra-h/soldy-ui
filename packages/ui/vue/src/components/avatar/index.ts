import { withParts } from '@soxa-ui/setup'
import type { TClosedComponent } from '../../adapter'
import AvatarComponent from './Avatar.vue'
import { AvatarGroup } from './group'
export { default as BaseAvatar, emitsAvatar, propsAvatar } from './base.component'
export type { AvatarProps } from './base.component'
export * from './group'
const AvatarOwner: TClosedComponent<typeof AvatarComponent> = AvatarComponent
export const Avatar = withParts(AvatarOwner, { Group: AvatarGroup })
