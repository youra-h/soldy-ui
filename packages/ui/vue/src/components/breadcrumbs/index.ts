import { withParts } from '@soxa-ui/setup'
import type { TClosedComponent } from '../../adapter'
import BreadcrumbsComponent from './Breadcrumbs.vue'
import { BreadcrumbsItem } from './item'
const BreadcrumbsOwner: TClosedComponent<typeof BreadcrumbsComponent> = BreadcrumbsComponent
export const Breadcrumbs = withParts(BreadcrumbsOwner, { Item: BreadcrumbsItem })
export { default as BaseBreadcrumbs, propsBreadcrumbs, emitsBreadcrumbs } from './base.component'
export type { BreadcrumbsProps } from './base.component'
export * from './item'
