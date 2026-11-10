import { MenuItemDescriptor, MenuCollectionItemDescriptor } from '@soxa-ui/setup'
import type { IMenuItem, TMenuItemCollectionFacade } from '@soxa-ui/core'
import {
	ElementBase,
	defineElement,
	type TElementClassOf,
	type TElementType,
} from '../../../adapter'
import { setupBreadcrumbsOverflowItem } from './setup.component'
import { breadcrumbsOverflowItemTemplate } from './overflow-item.template'

/** Internal Menu.Item assembly for native links in the Breadcrumbs overflow panel. */
export const TBreadcrumbsOverflowItemElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof MenuItemDescriptor,
	IMenuItem,
	TMenuItemCollectionFacade
> = ElementBase(HTMLDivElement, {
	descriptor: MenuItemDescriptor,
	facade: MenuCollectionItemDescriptor,
	template: breadcrumbsOverflowItemTemplate,
	root: { strategy: 'host', sets: ['attrs', 'dataset'], control: true },
	setup: setupBreadcrumbsOverflowItem,
})

defineElement('so-breadcrumbs-overflow-item', TBreadcrumbsOverflowItemElement, 'div')
export type TBreadcrumbsOverflowItemElementProps = TElementType<
	typeof TBreadcrumbsOverflowItemElement
>
