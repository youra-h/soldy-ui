import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'
import type { TAria, TAriaAttributes, TValuePayload } from '../../../common'

/** A location in the ordered navigation trail. */
export type TBreadcrumbsItem = {
	readonly text: string
	readonly href?: string
	readonly target?: string
	readonly rel?: string
}

/** Original item data and position, also supplied to the content slots. */
export type TBreadcrumbsEntry = {
	readonly item: TBreadcrumbsItem
	readonly index: number
	readonly current: boolean
	readonly aria: { readonly 'aria-current'?: 'page' }
	readonly dataset: {
		readonly 'data-current': 'true' | 'false'
		readonly 'data-breadcrumb-index': number
	}
	readonly attrs: { readonly href?: string; readonly target?: string; readonly rel?: string }
}

export interface IBreadcrumbsProps extends IStylableProps {
	items?: readonly TBreadcrumbsItem[]
	/** Maximum visible positions, including the overflow button. Zero shows all. */
	maxItems?: number
}

export type TBreadcrumbsEvents = TStylableEvents & {
	'change:items': (payload: TValuePayload<readonly TBreadcrumbsItem[]>) => void
	'change:maxItems': (payload: TValuePayload<number>) => void
	'change:overflowAria': (payload: TValuePayload<TAriaAttributes>) => void
}

export interface IBreadcrumbs extends IStylable<IBreadcrumbsProps, TBreadcrumbsEvents> {
	items: readonly TBreadcrumbsItem[]
	maxItems: number
	readonly entries: readonly TBreadcrumbsEntry[]
	readonly hiddenEntries: readonly TBreadcrumbsEntry[]
	readonly overflowAria: TAria
}
