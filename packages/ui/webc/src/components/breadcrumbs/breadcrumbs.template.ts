import type { IBreadcrumbs, IBreadcrumbsItem, TBreadcrumbsCollectionFacade } from '@soxa-ui/core'
import {
	bind,
	createItem,
	lendSamples,
	TKeyedLoop,
	type ITemplate,
	type TItemSlots,
} from '../../adapter'
import { TBreadcrumbsItemElement } from './item'

export const BREADCRUMBS_ITEM_SLOTS: TItemSlots = {
	item: 'default',
	'item-leading': 'leading',
	'item-trailing': 'trailing',
}

const loops = new WeakMap<HTMLElement, TKeyedLoop<IBreadcrumbsItem, number>>()

export const breadcrumbsTemplate: ITemplate<IBreadcrumbs, TBreadcrumbsCollectionFacade> = {
	create: (root, { hasSlot }) => {
		const list = root.ownerDocument.createElement('ol')
		list.className = 'so-breadcrumbs__list'
		root.append(list)

		if (!hasSlot('default')) loops.set(root, new TKeyedLoop(list, null, (item) => item.uid))

		return {
			slots: {
				default: { mode: 'append', node: list },
				item: { mode: 'sample' },
				'item-leading': { mode: 'sample' },
				'item-trailing': { mode: 'sample' },
			},
		}
	},
	bindings: [
		bind('shown', (ctx) => {
			loops.get(ctx.root)?.draw(ctx.state.shown ?? [], (item) => {
				const node = createItem(ctx.root.ownerDocument, TBreadcrumbsItemElement)
				node.ctrl = item
				lendSamples(ctx, node, BREADCRUMBS_ITEM_SLOTS)

				return node
			})
		}),
	],
}
