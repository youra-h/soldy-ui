import type { IToggleGroupItem, TToggleGroupItemCollectionFacade } from '@soxa-ui/core'
import { bind, type ITemplate } from '../../../adapter'

export const toggleGroupItemTemplate: ITemplate<
	IToggleGroupItem,
	TToggleGroupItemCollectionFacade
> = {
	create: (root) => {
		if (!root.hasAttribute('type')) root.setAttribute('type', 'button')

		const text = document.createElement('span')

		text.className = 'so-button__text'
		root.appendChild(text)

		return {
			slots: {
				leading: { mode: 'before', node: text },
				default: { mode: 'append', node: text },
				trailing: { mode: 'append', node: root },
			},
		}
	},

	bindings: [
		bind('text', ({ content, state, hasSlot }) => {
			if (hasSlot('default')) return

			content.textContent = String(state.text ?? '')
		}),
	],
}
