/**
 * `<button is="so-button">` — настоящая кнопка: форма, `submitter`, фокус и
 * доступность нативные. Кнопочная строка элемента коллекции на `div` и `span`
 * — свой элемент с тем же шаблоном (`registerItemRowTag`, `../item-row`).
 * docs/architecture.md, Layer 8d, «Элемент soxa — нативный элемент своего
 * тега».
 */

import { ButtonDescriptor } from '@soxa-ui/setup'
import type { IButton } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementOf } from '../../adapter'
import { buttonTemplate } from './button.template'
import { setupButton } from './setup.component'

export const TButtonElement: TElementClassOf<
	typeof HTMLButtonElement,
	typeof ButtonDescriptor,
	IButton
> = ElementBase(HTMLButtonElement, {
	descriptor: ButtonDescriptor,
	template: buttonTemplate,
	setup: setupButton,
})

defineElement('so-button', TButtonElement, 'button')

export type TButtonElementProps = TElementOf<HTMLButtonElement, typeof ButtonDescriptor, IButton>
