import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'
import type { TAria, TAriaAttributes, TChangeEvent, TValuePayload } from '../../../common'
import type { IBreadcrumbsCollectionProps } from './collection/types'

export interface IBreadcrumbsProps extends IStylableProps, IBreadcrumbsCollectionProps {
	/** Maximum visible positions, including overflow. Zero shows all. */
	maxItems?: number
}

export type TBreadcrumbsEvents = TStylableEvents & {
	'change:maxItems': (payload: TValuePayload<number>) => void
	'change:maxItems:before': (event: TChangeEvent<number>) => void
	'change:overflowAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IBreadcrumbs extends IStylable<IBreadcrumbsProps, TBreadcrumbsEvents> {
	maxItems: number
	readonly overflowAria: TAria
}
