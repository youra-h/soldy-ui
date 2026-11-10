import type { ITextable, ITextableProps, TTextableEvents } from '../../../base/textable'
import type { TChangeEvent, TValuePayload } from '../../../../common'
import type { IActivationCollectionItemProps } from '../../../base/collection'

export interface IBreadcrumbsItemProps extends ITextableProps, IActivationCollectionItemProps {
	href?: string
	target?: string
	rel?: string
}

export type TBreadcrumbsItemEvents = TTextableEvents & {
	'change:href': (payload: TValuePayload<string | undefined>) => void
	'change:href:before': (event: TChangeEvent<string | undefined>) => void
	'change:target': (payload: TValuePayload<string | undefined>) => void
	'change:target:before': (event: TChangeEvent<string | undefined>) => void
	'change:rel': (payload: TValuePayload<string | undefined>) => void
	'change:rel:before': (event: TChangeEvent<string | undefined>) => void
}

export interface IBreadcrumbsItem extends ITextable<IBreadcrumbsItemProps, TBreadcrumbsItemEvents> {
	href: string | undefined
	target: string | undefined
	rel: string | undefined
}
