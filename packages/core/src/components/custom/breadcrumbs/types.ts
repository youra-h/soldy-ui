import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'
import type { TAria, TAriaAttributes, TChangeEvent, TValuePayload } from '../../../common'
import type { IBreadcrumbsCollectionProps } from './collection/types'

/** Data or declarative navigation trail; current-page state uses standard item activation. */
export interface IBreadcrumbsProps extends IStylableProps, IBreadcrumbsCollectionProps {
	/**
	 * Maximum visible positions, including the overflow trigger. Defaults to 5; 0 shows all.
	 * Positive limits are rounded down and clamped to 3; invalid limits fall back to 5.
	 */
	maxItems?: number
}

export type TBreadcrumbsEvents = TStylableEvents & {
	'change:maxItems': (payload: TValuePayload<number>) => void
	/** May cancel or rewrite a limit change; the accepted value is normalized again. */
	'change:maxItems:before': (event: TChangeEvent<number>) => void
	'change:overflowAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IBreadcrumbs extends IStylable<IBreadcrumbsProps, TBreadcrumbsEvents> {
	maxItems: number
	/** Localized attributes for the overflow trigger, separate from the navigation landmark. */
	readonly overflowAria: TAria
}
