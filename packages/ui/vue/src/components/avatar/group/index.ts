import type { TClosedComponent } from '../../../adapter'
import AvatarGroupComponent from './AvatarGroup.vue'
export { default as BaseAvatarGroup, emitsAvatarGroup, propsAvatarGroup } from './base.component'
export type { AvatarGroupProps } from './base.component'
export const AvatarGroup: TClosedComponent<typeof AvatarGroupComponent> = AvatarGroupComponent
