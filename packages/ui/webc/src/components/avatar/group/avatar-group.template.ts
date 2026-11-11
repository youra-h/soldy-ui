import type { IAvatarGroup } from '@soxa-ui/core'
import { bind, type ITemplate } from '../../../adapter'

const parts = new WeakMap<HTMLElement, { overflow: HTMLElement; count: HTMLElement }>()
export const avatarGroupTemplate: ITemplate<IAvatarGroup> = {
	create: (root) => {
		const overflow = root.ownerDocument.createElement('span')
		const count = root.ownerDocument.createElement('span')
		overflow.className = 'so-avatar-group__overflow'
		count.className = 'so-avatar-group__count'
		overflow.append(count)
		root.append(overflow)
		parts.set(root, { overflow, count })
		return {
			slots: {
				default: { mode: 'before', node: overflow },
				'overflow-content': { mode: 'append', node: overflow },
			},
		}
	},
	bindings: [
		bind('displayOverflow', ({ root, state, hasSlot, showSlot }) => {
			const nodes = parts.get(root)
			if (!nodes) return
			const shown = Boolean(state.displayOverflow)
			showSlot('overflow-content', shown)
			if (shown) {
				if (nodes.overflow.parentNode !== root) root.append(nodes.overflow)
				if (hasSlot('overflow-content')) nodes.count.remove()
				else {
					nodes.count.textContent = state.displayOverflow ?? ''
					if (nodes.count.parentNode !== nodes.overflow)
						nodes.overflow.append(nodes.count)
				}
			} else nodes.overflow.remove()
		}),
	],
}
