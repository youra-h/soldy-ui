import { BreadcrumbsItemDescriptor, BreadcrumbsCollectionItemDescriptor } from '@soxa-ui/setup'
import type { IBreadcrumbsItem, TBreadcrumbsItemCollectionFacade } from '@soxa-ui/core'
import { ElementBase, type TElementClassOf, type TElementType } from '../../../adapter'
import { setupBreadcrumbsItem } from './setup.component'
import { breadcrumbsItemTemplate } from './breadcrumbs-item.template'
export const TBreadcrumbsItemElement: TElementClassOf<
	typeof HTMLLIElement,
	typeof BreadcrumbsItemDescriptor,
	IBreadcrumbsItem,
	TBreadcrumbsItemCollectionFacade
> = ElementBase(HTMLLIElement, {
	descriptor: BreadcrumbsItemDescriptor,
	facade: BreadcrumbsCollectionItemDescriptor,
	template: breadcrumbsItemTemplate,
	root: {
		strategy: 'host',
		sets: ['dataset'],
		order: true,
		control: true,
		shownBy: 'breadcrumbs_shown',
	},
	setup: setupBreadcrumbsItem,
})
export type TBreadcrumbsItemElementProps = TElementType<typeof TBreadcrumbsItemElement>
