import type { TClosedComponent } from '../../../adapter'
import ItemComponent from './Item.vue'

export const BreadcrumbsItem: TClosedComponent<typeof ItemComponent> = ItemComponent
export {
	default as BaseBreadcrumbsItem,
	propsBreadcrumbsItem,
	emitsBreadcrumbsItem,
} from './base.component'

export type { BreadcrumbsItemProps } from './base.component'
