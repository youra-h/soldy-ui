import type { IToggleGroup, IToggleGroupItem, TToggleGroupCollectionFacade } from '@soxa-ui/core'
import {
	TKeyedLoop,
	bind,
	createItem,
	lendSamples,
	type ITemplate,
	type ITemplateContext,
	type TItemSlots,
} from '../../adapter'
import { TToggleGroupItemElement, type TToggleGroupItemElementProps } from './item'

export const TOGGLE_GROUP_ITEM_SLOTS: TItemSlots = {
	item: 'default',
	'item-leading': 'leading',
	'item-trailing': 'trailing',
}

const loops = new WeakMap<HTMLElement, TKeyedLoop<IToggleGroupItem, number>>()

function radioOf(
	ctx: ITemplateContext<IToggleGroup, TToggleGroupCollectionFacade>,
	item: IToggleGroupItem,
): TToggleGroupItemElementProps {
	const radio = createItem(ctx.root.ownerDocument, TToggleGroupItemElement)

	radio.ctrl = item
	lendSamples(ctx, radio, TOGGLE_GROUP_ITEM_SLOTS)

	return radio
}

export const toggleGroupTemplate: ITemplate<IToggleGroup, TToggleGroupCollectionFacade> = {
	create: (root, { hasSlot }) => {
		if (!hasSlot('default')) {
			loops.set(root, new TKeyedLoop(root, null, (item: IToggleGroupItem) => item.uid))
		}

		return {
			slots: {
				default: { mode: 'append', node: root },
				item: { mode: 'sample' },
				'item-leading': { mode: 'sample' },
				'item-trailing': { mode: 'sample' },
			},
		}
	},

	bindings: [
		bind('shown', (ctx) => {
			loops.get(ctx.root)?.draw(ctx.state.shown ?? [], (item) => radioOf(ctx, item))
		}),
	],
}
