import type { TClosedComponent } from '../../adapter'
import BadgeComponent from './Badge.vue'

export { default as BaseBadge, emitsBadge, propsBadge } from './base.component'

export const Badge: TClosedComponent<typeof BadgeComponent> = BadgeComponent
