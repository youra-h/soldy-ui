import type { TValuePayload } from '../../../../common'
import type {
	IComponentView,
	IComponentViewProps,
	TComponentViewEvents,
} from '../../../base/component-view'

export interface IAvatarGroupProps extends IComponentViewProps {
	/** Number omitted by the application; children are never counted or trimmed. */
	overflow?: number
}
export type TAvatarGroupEvents = TComponentViewEvents & {
	'change:overflow': (payload: TValuePayload<number>) => void
}
export interface IAvatarGroup extends IComponentView<IAvatarGroupProps, TAvatarGroupEvents> {
	overflow: number
	readonly displayOverflow: string
}
