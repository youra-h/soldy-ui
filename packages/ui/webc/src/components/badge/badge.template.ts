import type { IBadge } from '@soxa-ui/core'
import { bind, ownerAttributes, type ITemplate } from '../../adapter'

const indicators = new WeakMap<HTMLElement, HTMLElement>()

export const badgeTemplate: ITemplate<IBadge> = {
	create: (root) => {
		const anchor = root.ownerDocument.createElement('span')
		const indicator = root.ownerDocument.createElement('span')
		anchor.className = 'so-badge__anchor'
		indicator.className = 'so-badge__indicator'
		root.append(anchor, indicator)
		indicators.set(root, indicator)
		return { slots: { anchor: { mode: 'append', node: anchor } } }
	},
	bindings: [
		bind('displayValue', ({ root, state }) => {
			const indicator = indicators.get(root)
			if (indicator) indicator.textContent = String(state.displayValue ?? '')
		}),
		bind('aria', ({ root, state }) => {
			const indicator = indicators.get(root)
			if (indicator) ownerAttributes(indicator, state.aria)
		}),
	],
}
