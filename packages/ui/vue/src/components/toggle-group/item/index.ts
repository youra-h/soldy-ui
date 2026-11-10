import type { TClosedComponent } from '../../../adapter'
import ToggleGroupItemComponent from './Item.vue'

export * from './base.component'
export { default as BaseToggleGroupItem } from './base.component'

export const ToggleGroupItem: TClosedComponent<typeof ToggleGroupItemComponent> =
	ToggleGroupItemComponent
