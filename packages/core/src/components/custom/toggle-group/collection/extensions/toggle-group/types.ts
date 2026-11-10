import type { TValuePayload } from '../../../../../../common'
import type { IToggleGroup } from '../../../types'
import type { TToggleGroupView } from '../../../types'
import type { IExtension, IExtensionItems } from '../../../../../base/collection'
import type { IToggleGroupItemExtension } from './item'
import type { IToggleGroupItem } from '../../../item/types'

export interface IToggleGroupExtension<TItem extends IToggleGroupItem = IToggleGroupItem>
	extends
		IExtension<TItem, TToggleGroupExtensionEvents>,
		IExtensionItems<TItem, IToggleGroupItemExtension<TItem>> {
	/** Available focused/remembered item, otherwise a selected item or the first enabled one. */
	readonly tabStop: TItem | undefined
	isEnabled(item: TItem): boolean
	readonly view: TToggleGroupView | undefined
}

export type TToggleGroupEngineOptions<TOwner extends IToggleGroup = IToggleGroup> = {
	owner: TOwner
}

export type TToggleGroupExtensionEvents = {
	'change:view': (payload: TValuePayload<TToggleGroupView | undefined>) => void
}
