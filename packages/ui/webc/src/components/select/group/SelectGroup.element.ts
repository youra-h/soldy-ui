/**
 * `<div is="so-select-group">` — опции Select под общей подписью
 * (`Select.Group`); регистрирует модуль Select.
 */

import { SelectGroupDescriptor } from '@soxa-ui/setup'
import type { IItemGroup } from '@soxa-ui/core'
import { ElementBase } from '../../../adapter'
import type { TElementClassOf, TElementType } from '../../../adapter'
import { selectGroupTemplate } from './select-group.template'
import { setupSelectGroup } from './setup.component'

export const TSelectGroupElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof SelectGroupDescriptor,
	IItemGroup
> = ElementBase(HTMLDivElement, {
	descriptor: SelectGroupDescriptor,
	template: selectGroupTemplate,
	setup: setupSelectGroup,
})

export type TSelectGroupElementProps = TElementType<typeof TSelectGroupElement>
