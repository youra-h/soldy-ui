import type {
	IBreadcrumbsItem,
	TBreadcrumbsItemCollectionFacade,
	TBreadcrumbsOverflowEntry,
} from '@soxa-ui/core'
import { DEFAULT_SLOT } from '@soxa-ui/setup'
import {
	bind,
	createDetail,
	createItem,
	lend,
	ownerAttributes,
	patch,
	TKeyedLoop,
	type ITemplate,
} from '../../../adapter'
import { registerItemRowTag, type TItemRowElementProps } from '../../item-row'
import { TMenuElement, type TMenuElementProps } from '../../menu'
import { TButtonElement, type TButtonElementProps } from '../../button'
import {
	TBreadcrumbsOverflowItemElement,
	type TBreadcrumbsOverflowItemElementProps,
} from '../OverflowItem.element'
const Row = registerItemRowTag('a')
type TParts = {
	row: TItemRowElementProps<HTMLAnchorElement>
	separator: HTMLSpanElement
	overflowSeparator: HTMLSpanElement
	menu: TMenuElementProps | null
	trigger: TButtonElementProps | null
	loop: TKeyedLoop<TBreadcrumbsOverflowEntry, number, TBreadcrumbsOverflowItemElementProps> | null
}
const parts = new WeakMap<HTMLElement, TParts>()
function separator(doc: Document): HTMLSpanElement {
	const node = doc.createElement('span')
	node.className = 'so-breadcrumbs__separator'
	node.setAttribute('aria-hidden', 'true')
	return node
}
export const breadcrumbsItemTemplate: ITemplate<
	IBreadcrumbsItem,
	TBreadcrumbsItemCollectionFacade
> = {
	create: (root) => {
		const row = createDetail(root.ownerDocument, Row, { embedded: 'breadcrumbs.row' })
		row.className = 'so-breadcrumbs__link'
		root.append(row)
		parts.set(root, {
			row,
			separator: separator(root.ownerDocument),
			overflowSeparator: separator(root.ownerDocument),
			menu: null,
			trigger: null,
			loop: null,
		})
		return {
			control: row,
			slots: {
				leading: { mode: 'append', node: row, slot: 'leading' },
				default: { mode: 'append', node: row, slot: DEFAULT_SLOT },
				trailing: { mode: 'append', node: row, slot: 'trailing' },
			},
		}
	},
	bindings: [
		bind(
			['text', 'size', 'variant', 'disabled', 'aria', 'attrs'],
			({ root, state, hasSlot }) => {
				const own = parts.get(root)
				if (!own) return
				patch(own.row, {
					size: state.size,
					variant: state.variant,
					disabled: state.disabled,
				})
				ownerAttributes(own.row, { ...state.attrs, ...state.aria })
				if (!hasSlot(DEFAULT_SLOT)) own.row.text = state.text ?? ''
			},
		),
		bind('breadcrumbs_separator', ({ root, state }) => {
			const own = parts.get(root)
			if (!own) return
			if (state.breadcrumbs_separator) own.row.before(own.separator)
			else own.separator.remove()
		}),
		bind(
			['breadcrumbs_menu', 'breadcrumbs_overflowEntries', 'breadcrumbs_overflowAria', 'size'],
			({ root, state }) => {
				const own = parts.get(root)
				if (!own) return
				if (!state.breadcrumbs_menu) {
					own.menu?.remove()
					own.overflowSeparator.remove()
					return
				}
				if (!own.menu) {
					const menu = createDetail(root.ownerDocument, TMenuElement, {
						embedded: 'breadcrumbs.menu',
					})
					menu.ctrl = state.breadcrumbs_menu
					menu.className = 'so-breadcrumbs__overflow'
					const trigger = createDetail(root.ownerDocument, TButtonElement, {
						embedded: 'breadcrumbs.trigger',
						attributes: { type: 'button' },
					})
					trigger.className = 'so-breadcrumbs__trigger'
					trigger.text = String.fromCodePoint(8230)
					const list = root.ownerDocument.createElement('div')
					lend(menu, 'trigger', trigger)
					lend(menu, DEFAULT_SLOT, list)
					own.menu = menu
					own.trigger = trigger
					own.loop = new TKeyedLoop(list, null, (entry) => entry.item.uid)
				}
				if (own.trigger) {
					patch(own.trigger, { size: state.size })
					const label = state.breadcrumbs_overflowAria?.['aria-label']
					if (label === undefined) own.trigger.removeAttribute('aria-label')
					else own.trigger.setAttribute('aria-label', String(label))
				}
				own.loop?.draw(
					state.breadcrumbs_overflowEntries ?? [],
					(entry) => {
						const node = createItem(root.ownerDocument, TBreadcrumbsOverflowItemElement)
						node.ctrl = entry.menuItem
						ownerAttributes(node, entry.item.attrs.toObject())
						return node
					},
					(node, entry) => ownerAttributes(node, entry.item.attrs.toObject()),
				)
				if (own.menu.parentNode !== root) root.append(own.overflowSeparator, own.menu)
			},
		),
	],
}
