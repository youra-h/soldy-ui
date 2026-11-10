import {
	TFactoryExtension,
	TCollectionEngine,
	TOrderExtension,
	TPlainExtension,
	TUniqueExtension,
	TMetaExtension,
	TBatchExtension,
	TSelectionExtension,
} from '../../../base/collection'
import type {
	ICollectionProps,
	IBatchCollectionProps,
	ISelectionCollectionItemProps,
	ISelectionCollectionProps,
} from '../../../base/collection'
import { TToggleGroupExtension } from './extensions'
import type { IToggleGroup } from '../types'
import type { IToggleGroupItem } from '../item/types'
import type { IToggleGroupItemProps } from '../item/types'
import type {
	TSelectionCollectionFacadeEvents,
	TSelectionItemFacadeEvents,
} from '../../../base/collection'
import type {
	TToggleGroupEngineOptions,
	TToggleGroupExtensionEvents,
	TToggleGroupItemEventsExtension,
} from './extensions'

export type TToggleGroupCollectionExtensions<TItem extends IToggleGroupItem = IToggleGroupItem> = {
	factory: TFactoryExtension<TItem>
	unique: TUniqueExtension<TItem>
	meta: TMetaExtension<TItem>
	order: TOrderExtension<TItem>
	plain: TPlainExtension<TItem>
	batch: TBatchExtension<TItem>
	selection: TSelectionExtension<TItem>
	toggleGroup: TToggleGroupExtension<IToggleGroup, TItem>
}

export type TToggleGroupCollection = TCollectionEngine<
	IToggleGroupItem,
	TToggleGroupCollectionExtensions,
	TToggleGroupEngineOptions
>

/** Accepts engines from any assembly level; the facade installs missing extensions. */
export type TToggleGroupCollectionFacadeEngine = TCollectionEngine<any, any>

export interface IToggleGroupCollectionProps<
	TItemProps = IToggleGroupItemProps,
	TItem = IToggleGroupItem,
>
	extends
		ICollectionProps<TToggleGroupCollectionFacadeEngine>,
		IBatchCollectionProps<TItemProps, TItem>,
		ISelectionCollectionProps {}

export interface IToggleGroupCollectionItemProps extends ISelectionCollectionItemProps {}

export type TToggleGroupCollectionFacadeEvents =
	TSelectionCollectionFacadeEvents<IToggleGroupItem> & TToggleGroupExtensionEvents

export type TToggleGroupItemCollectionFacadeEvents = TSelectionItemFacadeEvents &
	TToggleGroupItemEventsExtension
