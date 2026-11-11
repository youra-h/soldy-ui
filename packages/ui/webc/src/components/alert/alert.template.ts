import type { IAlert } from '@soxa-ui/core'
import { DEFAULT_SLOT } from '@soxa-ui/setup'
import { bind, createDetail, lend, ownerAttributes, type ITemplate } from '../../adapter'
import { lendRoleIcon } from '../common/icon-button'
import { TButtonElement, type TButtonElementProps } from '../button'

const buttons = new WeakMap<HTMLElement, TButtonElementProps>()

export const alertTemplate: ITemplate<IAlert> = {
	create: (root, ctx) => {
		const doc = root.ownerDocument
		const icon = doc.createElement('span')
		const body = doc.createElement('div')
		const title = doc.createElement('div')
		const content = doc.createElement('div')
		const action = doc.createElement('div')
		const close = createDetail(doc, TButtonElement, {
			embedded: 'alert.close',
			attributes: { type: 'button' },
		})
		const closeIcon = doc.createElement('span')

		icon.className = 'so-alert__icon'
		icon.setAttribute('aria-hidden', 'true')
		body.className = 'so-alert__body'
		title.className = 'so-alert__title'
		content.className = 'so-alert__content'
		action.className = 'so-alert__action'
		close.className = 'so-alert__close'
		closeIcon.setAttribute('aria-hidden', 'true')

		if (!ctx.hasSlot('close-icon')) lendRoleIcon(closeIcon, 'close', 'alert.close-icon')

		lend(close, DEFAULT_SLOT, closeIcon)
		close.addEventListener('click', () => ctx.ctrl?.hide())
		body.append(title, content)
		root.append(icon, body, action)
		buttons.set(root, close)

		return {
			slots: {
				icon: { mode: 'append', node: icon },
				title: { mode: 'append', node: title },
				default: { mode: 'append', node: content },
				action: { mode: 'append', node: action },
				'close-icon': { mode: 'append', node: closeIcon },
			},
		}
	},
	bindings: [
		bind(['closable', 'closeAria'], ({ root, state }) => {
			const close = buttons.get(root)

			if (!close) return

			ownerAttributes(close, state.closeAria)

			if (state.closable !== true) {
				close.remove()
			} else if (close.parentNode !== root) {
				root.append(close)
			}
		}),
	],
}
