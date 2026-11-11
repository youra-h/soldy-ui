import type { TValuePayload } from '../../../common'
import type {
	IComponentView,
	IComponentViewProps,
	TComponentViewEvents,
} from '../../base/component-view'

export type TSeparatorOrientation = 'horizontal' | 'vertical'

export interface ISeparatorProps extends IComponentViewProps {
	orientation?: TSeparatorOrientation
	/** Decorative boundaries are omitted from the accessibility tree. */
	decorative?: boolean
}

export type TSeparatorEvents = TComponentViewEvents & {
	'change:orientation': (payload: TValuePayload<TSeparatorOrientation>) => void
	'change:decorative': (payload: TValuePayload<boolean>) => void
}

export interface ISeparator extends IComponentView<ISeparatorProps, TSeparatorEvents> {
	orientation: TSeparatorOrientation
	decorative: boolean
}
