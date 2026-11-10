import type { HTMLAnchorAttributes } from 'svelte/elements'
import type { MenuItemProps } from '../../menu/item/base.component'

/** Menu.Item contract plus the native attributes forwarded to its anchor row. */
export type BreadcrumbsOverflowItemProps = MenuItemProps &
	Pick<HTMLAnchorAttributes, 'href' | 'target' | 'rel'>

export type { MenuItemAttributes as BreadcrumbsOverflowItemAttributes } from '../../menu/item/base.component'
