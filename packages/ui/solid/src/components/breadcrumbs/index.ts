import { withParts } from '@soxa-ui/setup'
import { Breadcrumbs as BreadcrumbsComponent } from './Breadcrumbs'
import { BreadcrumbsItem } from './item'

export * from './base.component'

export * from './item'

export const Breadcrumbs = withParts(BreadcrumbsComponent, { Item: BreadcrumbsItem })
