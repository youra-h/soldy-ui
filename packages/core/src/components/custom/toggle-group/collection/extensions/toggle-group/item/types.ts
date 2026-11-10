import type { TValuePayload } from '../../../../../../../common'
import type { IItemExtension, TBaseItemEventsExtension } from '../../../../../../base/collection'
import type { TToggleGroupView } from '../../../../types'

export type TToggleGroupItemEventsExtension = TBaseItemEventsExtension & {
	'change:view': (payload: TValuePayload<TToggleGroupView | undefined>) => void
}

export interface IToggleGroupItemExtension<TItem extends object = any> extends IItemExtension<
	TItem,
	TToggleGroupItemEventsExtension
> {
	readonly view: TToggleGroupView | undefined
}
