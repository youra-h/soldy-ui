import { ToggleGroupCollectionDescriptor, ToggleGroupDescriptor } from '@soxa-ui/setup'
import type { IToggleGroup, TToggleGroupCollectionFacade } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { TToggleGroupItemElement } from './item'
import { toggleGroupTemplate } from './toggle-group.template'
import { setupToggleGroup } from './setup.component'

export const TToggleGroupElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof ToggleGroupDescriptor,
	IToggleGroup,
	TToggleGroupCollectionFacade
> = ElementBase(HTMLDivElement, {
	descriptor: ToggleGroupDescriptor,
	facade: ToggleGroupCollectionDescriptor,
	template: toggleGroupTemplate,
	setup: setupToggleGroup,
})

defineElement('so-toggle-group', TToggleGroupElement, 'div')
defineElement('so-toggle-group-item', TToggleGroupItemElement, 'button')

export type TToggleGroupElementProps = TElementType<typeof TToggleGroupElement>
