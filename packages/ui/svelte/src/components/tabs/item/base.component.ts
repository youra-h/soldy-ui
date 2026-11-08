import type { ITabsItem } from '@soxa-ui/core'
import type { TabsCollectionItemDescriptor, TabsItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

export type TabsItemEventProps = EventProps<typeof TabsItemDescriptor> &
	EventProps<typeof TabsCollectionItemDescriptor>

/** Атрибуты таба: класс и стиль — корню, остальное — строке с `role="tab"`. */
export type TabsItemAttributes = TDomAttributes<typeof TabsItemDescriptor, TabsItemEventProps>

export type TabsItemProps = UseDomProps<typeof TabsItemDescriptor, ITabsItem, TabsItemEventProps>
