import { ToggleGroupCollectionItemDescriptor, ToggleGroupItemDescriptor } from '@soxa-ui/setup'
import type { IToggleGroupItem, TToggleGroupItemCollectionFacade } from '@soxa-ui/core'
import { ElementBase } from '../../../adapter'
import type { TElementClassOf, TElementType } from '../../../adapter'
import { toggleGroupItemTemplate } from './toggle-group-item.template'
import { setupToggleGroupItem } from './setup.component'

export const TToggleGroupItemElement: TElementClassOf<
	typeof HTMLButtonElement,
	typeof ToggleGroupItemDescriptor,
	IToggleGroupItem,
	TToggleGroupItemCollectionFacade
> = ElementBase(HTMLButtonElement, {
	descriptor: ToggleGroupItemDescriptor,
	facade: ToggleGroupCollectionItemDescriptor,
	template: toggleGroupItemTemplate,
	setup: setupToggleGroupItem,
})

export type TToggleGroupItemElementProps = TElementType<typeof TToggleGroupItemElement>
