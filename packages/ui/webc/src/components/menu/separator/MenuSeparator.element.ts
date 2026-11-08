/**
 * `<div is="so-menu-separator">` — линия между группами пунктов. Ручной
 * разделитель разметки `groupSeparators` меню не трогает.
 */

import { MenuSeparatorDescriptor } from '@soxa-ui/setup'
import type { TMenuSeparator } from '@soxa-ui/core'
import { ElementBase } from '../../../adapter'
import type { TElementClassOf, TElementType } from '../../../adapter'
import { menuSeparatorTemplate } from './menu-separator.template'
import { setupMenuSeparator } from './setup.component'

export const TMenuSeparatorElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof MenuSeparatorDescriptor,
	TMenuSeparator
> = ElementBase(HTMLDivElement, {
	descriptor: MenuSeparatorDescriptor,
	template: menuSeparatorTemplate,
	setup: setupMenuSeparator,
})

export type TMenuSeparatorElementProps = TElementType<typeof TMenuSeparatorElement>
