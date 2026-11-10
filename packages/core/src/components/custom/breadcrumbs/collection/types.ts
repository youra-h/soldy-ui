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

/** Owns breadcrumb membership and activation, including ancestors collapsed into the menu. */
export type TBreadcrumbsCollection = TCollectionEngine<
	IBreadcrumbsItem,
	TBreadcrumbsCollectionExtensions,
	TBreadcrumbsEngineOptions
>

/** Existing engines are accepted and completed with any missing Breadcrumbs extensions. */
export type TBreadcrumbsCollectionFacadeEngine = TCollectionEngine<any, any>

export type TBreadcrumbsEngineOptions<TOwner extends IBreadcrumbs = IBreadcrumbs> = {
	owner: TOwner
}

/**
 * Standard items/engine/trackBy input. Data items use `_: { active: true }` for the current page;
 * declarative items register through their own facade and use its active property.
 */
export interface IBreadcrumbsCollectionProps
	extends
		ICollectionProps<TBreadcrumbsCollectionFacadeEngine>,
		IBatchCollectionProps<IBreadcrumbsItemProps, IBreadcrumbsItem> {}

export type TBreadcrumbsCollectionFacadeEvents =
	TActivationCollectionFacadeEvents<IBreadcrumbsItem> & TBreadcrumbsExtensionEvents

export type TBreadcrumbsItemCollectionFacadeEvents = TActivationItemFacadeEvents &
	TBreadcrumbsItemExtensionEvents
