import { MenuItemDescriptor, MenuCollectionItemDescriptor, DEFAULT_SLOT } from '@soxa-ui/setup'
import type { IMenuItem, TMenuItemCollectionFacade } from '@soxa-ui/core'
import {
	ElementBase,
	defineElement,
	bind,
	createDetail,
	ownerAttributes,
	patch,
	type ITemplate,
	type TElementClassOf,
	type TElementType,
} from '../../adapter'
import { registerItemRowTag, type TItemRowElementProps } from '../item-row'
import { setupMenuItem } from '../menu/item/setup.component'

const Row = registerItemRowTag('a')
const rows = new WeakMap<HTMLElement, TItemRowElementProps<HTMLAnchorElement>>()
const template: ITemplate<IMenuItem, TMenuItemCollectionFacade> = {
	create: (root, ctx) => {
		const row = createDetail(root.ownerDocument, Row, { embedded: 'menu.row' })

		row.addEventListener('click', (event) => {
			if (!event.defaultPrevented) ctx.facade?.context?.adapters.menu.choose()
		})
		root.append(row)
		rows.set(root, row)

		return {
			slots: { default: { mode: 'append', node: row, slot: DEFAULT_SLOT } },
			control: row,
		}
	},
	bindings: [
		bind(['size', 'disabled', 'text', 'aria'], ({ root, state, hasSlot }) => {
			const row = rows.get(root)

			if (!row) return

			patch(row, { size: state.size, disabled: state.disabled })
			if (!hasSlot(DEFAULT_SLOT)) row.text = state.text ?? ''
			ownerAttributes(row, state.aria)
		}),
	],
}
export const TBreadcrumbsOverflowItemElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof MenuItemDescriptor,
	IMenuItem,
	TMenuItemCollectionFacade
> = ElementBase(HTMLDivElement, {
	descriptor: MenuItemDescriptor,
	facade: MenuCollectionItemDescriptor,
	template,
	root: { strategy: 'host', sets: ['attrs', 'dataset'], control: true },
	setup: setupMenuItem,
})

defineElement('so-breadcrumbs-overflow-item', TBreadcrumbsOverflowItemElement, 'div')
export type TBreadcrumbsOverflowItemElementProps = TElementType<
	typeof TBreadcrumbsOverflowItemElement
>
