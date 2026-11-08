/**
 * `<div is="so-scroller">` — лента в одну строку с двумя кнопками. Своего
 * экземпляра у вьюпорта нет: роль ряда он получает набором `viewportAria`.
 */

import { ScrollerDescriptor } from '@soxa-ui/setup'
import type { IScroller } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { scrollerTemplate } from './scroller.template'
import { setupScroller } from './setup.component'

export const TScrollerElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof ScrollerDescriptor,
	IScroller
> = ElementBase(HTMLDivElement, {
	descriptor: ScrollerDescriptor,
	template: scrollerTemplate,
	setup: setupScroller,
})

defineElement('so-scroller', TScrollerElement, 'div')

export type TScrollerElementProps = TElementType<typeof TScrollerElement>
