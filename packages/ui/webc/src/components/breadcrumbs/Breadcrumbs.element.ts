import { BreadcrumbsDescriptor, BreadcrumbsCollectionDescriptor } from '@soxa-ui/setup'
import type { IBreadcrumbs, TBreadcrumbsCollectionFacade } from '@soxa-ui/core'
import { ElementBase, defineElement, type TElementClassOf, type TElementType } from '../../adapter'
import { TBreadcrumbsItemElement } from './item'
import { breadcrumbsTemplate } from './breadcrumbs.template'
import { setupBreadcrumbs } from './setup.component'

export const TBreadcrumbsElement: TElementClassOf<
	typeof HTMLElement,
	typeof BreadcrumbsDescriptor,
	IBreadcrumbs,
	TBreadcrumbsCollectionFacade
> = ElementBase(HTMLElement, {
	descriptor: BreadcrumbsDescriptor,
	facade: BreadcrumbsCollectionDescriptor,
	template: breadcrumbsTemplate,
	setup: setupBreadcrumbs,
})
defineElement('so-breadcrumbs', TBreadcrumbsElement, 'nav')
defineElement('so-breadcrumbs-item', TBreadcrumbsItemElement, 'li')
export type TBreadcrumbsElementProps = TElementType<typeof TBreadcrumbsElement>
