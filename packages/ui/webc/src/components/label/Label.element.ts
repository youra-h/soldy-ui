/**
 * `<label is="so-label">` — подпись: контрол — первый labelable-потомок, связки
 * через `for` и `id` нет. docs/architecture.md, Layer 8d, «Подпись».
 */

import { LabelDescriptor } from '@soxa-ui/setup'
import type { ILabel } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { labelTemplate } from './label.template'
import { setupLabel } from './setup.component'

export const TLabelElement: TElementClassOf<
	typeof HTMLLabelElement,
	typeof LabelDescriptor,
	ILabel
> = ElementBase(HTMLLabelElement, {
	descriptor: LabelDescriptor,
	template: labelTemplate,
	setup: setupLabel,
})

defineElement('so-label', TLabelElement, 'label')

export type TLabelElementProps = TElementType<typeof TLabelElement>
