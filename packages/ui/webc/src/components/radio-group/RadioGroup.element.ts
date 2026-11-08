/**
 * `<div is="so-radio-group">` — группа радио; модуль регистрирует и радио.
 * docs/architecture.md, Layer 8d, «Коллекция».
 */

import { RadioGroupCollectionDescriptor, RadioGroupDescriptor } from '@soxa-ui/setup'
import type { IRadioGroup, TRadioGroupCollectionFacade } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { TRadioGroupItemElement } from './item'
import { radioGroupTemplate } from './radio-group.template'
import { setupRadioGroup } from './setup.component'

export const TRadioGroupElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof RadioGroupDescriptor,
	IRadioGroup,
	TRadioGroupCollectionFacade
> = ElementBase(HTMLDivElement, {
	descriptor: RadioGroupDescriptor,
	facade: RadioGroupCollectionDescriptor,
	template: radioGroupTemplate,
	setup: setupRadioGroup,
})

defineElement('so-radio-group', TRadioGroupElement, 'div')
defineElement('so-radio-group-item', TRadioGroupItemElement, 'label')

export type TRadioGroupElementProps = TElementType<typeof TRadioGroupElement>
