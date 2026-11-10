import type { TClosedComponent } from '../../adapter'
import BreadcrumbsComponent from './Breadcrumbs.vue'

export const Breadcrumbs: TClosedComponent<typeof BreadcrumbsComponent> = BreadcrumbsComponent
export { default as BaseBreadcrumbs, propsBreadcrumbs, emitsBreadcrumbs } from './base.component'
export type { BreadcrumbsProps } from './base.component'
