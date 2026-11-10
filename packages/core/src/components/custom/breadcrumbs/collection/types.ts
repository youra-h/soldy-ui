import type {
	ICollectionProps,
	IBatchCollectionProps,
	TActivationCollectionFacadeEvents,
	TActivationItemFacadeEvents,
	TCollectionEngine,
	TFactoryExtension,
	TUniqueExtension,
	TMetaExtension,
	TOrderExtension,
	TPlainExtension,
	TBatchExtension,
	TActivationExtension,
} from '../../../base/collection'
import type { IBreadcrumbsItem, IBreadcrumbsItemProps } from '../item/types'
import type { IBreadcrumbs } from '../types'
import type {
	TBreadcrumbsExtension,
	TBreadcrumbsExtensionEvents,
	TBreadcrumbsItemExtensionEvents,
} from './extensions'

export type TBreadcrumbsCollectionExtensions<TItem extends IBreadcrumbsItem = IBreadcrumbsItem> = {
	factory: TFactoryExtension<TItem>
	unique: TUniqueExtension<TItem>
	meta: TMetaExtension<TItem>
	order: TOrderExtension<TItem>
	plain: TPlainExtension<TItem>
	batch: TBatchExtension<TItem>
	activation: TActivationExtension<TItem>
	breadcrumbs: TBreadcrumbsExtension<IBreadcrumbs, TItem>
}

export type TBreadcrumbsCollection = TCollectionEngine<
	IBreadcrumbsItem,
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsEngineOptions
>

export type TBreadcrumbsCollectionFacadeEngine = TCollectionEngine<any, any>

export type TBreadcrumbsEngineOptions<TOwner extends IBreadcrumbs = IBreadcrumbs> = {
	owner: TOwner
}

export interface IBreadcrumbsCollectionProps
	extends
		ICollectionProps<TBreadcrumbsCollectionFacadeEngine>,
		IBatchCollectionProps<IBreadcrumbsItemProps, IBreadcrumbsItem> {}

export type TBreadcrumbsCollectionFacadeEvents =
	TActivationCollectionFacadeEvents<IBreadcrumbsItem> & TBreadcrumbsExtensionEvents

export type TBreadcrumbsItemCollectionFacadeEvents = TActivationItemFacadeEvents &
	TBreadcrumbsItemExtensionEvents
