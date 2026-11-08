import type { ITabsContent } from '@soxa-ui/core'
import type { TabsCollectionContentDescriptor, TabsContentDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type TabsContentEventProps = EventProps<typeof TabsContentDescriptor> &
	EventProps<typeof TabsCollectionContentDescriptor>

export type TabsContentProps = UseDomProps<
	typeof TabsContentDescriptor,
	ITabsContent,
	TabsContentEventProps
>
