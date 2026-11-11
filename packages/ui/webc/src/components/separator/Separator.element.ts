import { SeparatorDescriptor } from '@soxa-ui/setup'
import type { ISeparator } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { separatorTemplate } from './separator.template'
import { setupSeparator } from './setup.component'

export const TSeparatorElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof SeparatorDescriptor,
	ISeparator
> = ElementBase(HTMLDivElement, {
	descriptor: SeparatorDescriptor,
	template: separatorTemplate,
	setup: setupSeparator,
})

defineElement('so-separator', TSeparatorElement, 'div')

export type TSeparatorElementProps = TElementType<typeof TSeparatorElement>
