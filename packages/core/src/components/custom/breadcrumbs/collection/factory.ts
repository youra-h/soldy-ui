import { activationExtensions } from '../../../base/collection/create/internal'
import type { TExtensionSet } from '../../../base/collection/create/internal'
import type { IBreadcrumbsItem } from '../item/types'
import TBreadcrumbsItem from '../item/item.class'
import { TBreadcrumbsExtension } from './extensions'

export function breadcrumbsExtensions(): TExtensionSet<IBreadcrumbsItem> {
	return {
		...activationExtensions<IBreadcrumbsItem>(TBreadcrumbsItem),
		breadcrumbs: () => new TBreadcrumbsExtension(),
	}
}
