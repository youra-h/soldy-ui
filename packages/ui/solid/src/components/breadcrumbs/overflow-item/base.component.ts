import type { JSX } from 'solid-js'
import type { MenuItemProps } from '../../menu/item/base.component'

/** Menu.Item contract plus the native attributes forwarded to its anchor row. */
export type BreadcrumbsOverflowItemProps = MenuItemProps &
	Pick<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'>

export type { MenuItemAttributes as BreadcrumbsOverflowItemAttributes } from '../../menu/item/base.component'
