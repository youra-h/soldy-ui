import type { TClosedComponent } from '../../adapter'
import SeparatorComponent from './Separator.vue'

export * from './base.component'
export { default as BaseSeparator } from './base.component'

export const Separator: TClosedComponent<typeof SeparatorComponent> = SeparatorComponent
