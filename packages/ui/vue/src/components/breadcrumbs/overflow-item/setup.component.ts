import SetupMenuItem from '../../menu/item/setup.component'
import BaseBreadcrumbsOverflowItem from './base.component'

/** Keep Menu.Item's collection membership, keyboard handling and lifetime for the anchor row. */
export default {
	...SetupMenuItem,
	name: '_BreadcrumbsOverflowItem',
	extends: BaseBreadcrumbsOverflowItem,
}
