import type { HTMLAttributes } from 'react'
import type { ITabs } from '@soxa-ui/core'
import type { TabsCollectionDescriptor, TabsDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../types'

/** События Tabs — свои и фасада коллекции. */
export type TabsEventProps = EventProps<typeof TabsDescriptor> &
	EventProps<typeof TabsCollectionDescriptor>

/** Атрибуты набора: класс и стиль — корню, остальное — списку табов с `role="tablist"`. */
export type TabsAttributes = TDomAttributes<
	typeof TabsDescriptor,
	HTMLAttributes<HTMLElement>,
	TabsEventProps
>

export type TabsProps = UseDomProps<typeof TabsDescriptor, ITabs, TabsEventProps>
