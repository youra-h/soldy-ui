import { withParts } from '@soxa-ui/setup'
import BreadcrumbsComponent from './Breadcrumbs.svelte'
import { BreadcrumbsItem } from './item'

export * from './base.component'

export * from './item'

export const Breadcrumbs = withParts(BreadcrumbsComponent, { Item: BreadcrumbsItem })
