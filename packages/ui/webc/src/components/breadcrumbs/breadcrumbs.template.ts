import type { IBreadcrumbs, TBreadcrumbsEntry } from '@soxa-ui/core'
import { DEFAULT_SLOT } from '@soxa-ui/setup'
import {
	bind,
	createDetail,
	createItem,
	lend,
	ownerAttributes,
	patch,
	type ITemplate,
	type ITemplateContext,
} from '../../adapter'
import { TMenuElement } from '../menu'
import { TButtonElement } from '../button'
import { TBreadcrumbsOverflowItemElement } from './OverflowItem.element'
import { breadcrumbsMenuOf } from './setup.component'

const lists = new WeakMap<HTMLElement, HTMLOListElement>()
function separator(doc: Document): HTMLElement {
	const node = doc.createElement('span')

	node.className = 'so-breadcrumbs__separator'
	node.setAttribute('aria-hidden', 'true')

	return node
}
function content(ctx: ITemplateContext<IBreadcrumbs>, entry: TBreadcrumbsEntry): DocumentFragment {
	const fragment = ctx.root.ownerDocument.createDocumentFragment()
	const leading = ctx.sample('item-leading'),
		body = ctx.sample('item'),
		trailing = ctx.sample('item-trailing')
	if (leading) fragment.append(leading)
	fragment.append(body ?? ctx.root.ownerDocument.createTextNode(entry.item.text))
	if (trailing) fragment.append(trailing)

	return fragment
}
export const breadcrumbsTemplate: ITemplate<IBreadcrumbs> = {
	create: (root) => {
		const list = root.ownerDocument.createElement('ol')

		list.className = 'so-breadcrumbs__list'
		root.append(list)
		lists.set(root, list)

		return {
			slots: {
				item: { mode: 'sample' },
				'item-leading': { mode: 'sample' },
				'item-trailing': { mode: 'sample' },
			},
		}
	},
	bindings: [
		bind(['entries', 'hiddenEntries'], (ctx) => {
			const list = lists.get(ctx.root),
				menu = breadcrumbsMenuOf(ctx.root)

			if (!list || !menu) return

			const doc = ctx.root.ownerDocument,
				fragment = doc.createDocumentFragment()
			for (const [position, entry] of (ctx.state.entries ?? []).entries()) {
				if (position === 1 && ctx.state.hiddenEntries?.length) {
					const li = doc.createElement('li')

					li.className = 'so-breadcrumbs__item'
					li.append(separator(doc))
					const overflow = createDetail(doc, TMenuElement, {
						embedded: 'breadcrumbs.menu',
					})

					overflow.ctrl = menu
					overflow.classList.add('so-breadcrumbs__overflow')
					patch(overflow, { size: ctx.state.size, variant: ctx.state.variant })
					const trigger = createDetail(doc, TButtonElement, {
						embedded: 'breadcrumbs.trigger',
					})

					trigger.classList.add('so-breadcrumbs__trigger')
					trigger.type = 'button'
					trigger.text = '…'
					trigger.size = ctx.state.size
					ownerAttributes(trigger, ctx.state.overflowAria)
					lend(overflow, 'trigger', trigger)
					for (const hidden of ctx.state.hiddenEntries) {
						const item = createItem(doc, TBreadcrumbsOverflowItemElement)

						item.text = hidden.item.text
						item.disabled = hidden.item.href === undefined
						for (const [key, value] of Object.entries({
							...hidden.attrs,
							'data-breadcrumb-index': hidden.index,
						}))
							if (value !== undefined) item.setAttribute(key, String(value))
						lend(item, DEFAULT_SLOT, content(ctx, hidden))
						lend(overflow, DEFAULT_SLOT, item)
					}
					li.append(overflow)
					fragment.append(li)
				}
				const li = doc.createElement('li')

				li.className = 'so-breadcrumbs__item'
				if (position > 0) li.append(separator(doc))
				const link = doc.createElement(entry.item.href === undefined ? 'span' : 'a')

				link.className = 'so-breadcrumbs__link'
				for (const [key, value] of Object.entries({
					...entry.attrs,
					...entry.aria,
					...entry.dataset,
				}))
					if (value !== undefined) link.setAttribute(key, String(value))
				link.append(content(ctx, entry))
				li.append(link)
				fragment.append(li)
			}
			list.replaceChildren(fragment)
		}),
		bind(['size', 'variant', 'overflowAria'], ({ root, state }) => {
			const overflow = root.querySelector('.so-breadcrumbs__overflow')
			const trigger = root.querySelector('.so-breadcrumbs__trigger')
			if (overflow instanceof TMenuElement)
				patch(overflow, { size: state.size, variant: state.variant })
			if (trigger instanceof TButtonElement) {
				patch(trigger, { size: state.size })
				ownerAttributes(trigger, state.overflowAria)
			}
		}),
	],
}
