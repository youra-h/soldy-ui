import type { IAvatar } from '@soxa-ui/core'
import { bind, type ITemplate } from '../../adapter'

const parts = new WeakMap<HTMLElement, { image: HTMLImageElement; fallback: HTMLElement }>()
export const avatarTemplate: ITemplate<IAvatar> = {
	create: (root) => {
		const image = root.ownerDocument.createElement('img')
		const fallback = root.ownerDocument.createElement('span')
		image.className = 'so-avatar__image'
		image.alt = ''
		fallback.className = 'so-avatar__fallback'
		fallback.setAttribute('aria-hidden', 'true')
		root.append(fallback)
		parts.set(root, { image, fallback })
		return { slots: { fallback: { mode: 'append', node: fallback } } }
	},
	bindings: [
		bind(['src', 'initials', 'status'], ({ root, state, hasSlot, showSlot }) => {
			const nodes = parts.get(root)
			if (!nodes) return
			const loaded = state.status === 'loaded'
			showSlot('fallback', !loaded)
			if (loaded) {
				nodes.fallback.remove()
				if (state.src) nodes.image.src = state.src
				if (nodes.image.parentNode !== root) root.append(nodes.image)
			} else {
				nodes.image.remove()
				nodes.image.removeAttribute('src')
				if (nodes.fallback.parentNode !== root) root.append(nodes.fallback)
				if (!hasSlot('fallback')) nodes.fallback.textContent = state.initials ?? ''
			}
		}),
	],
}
