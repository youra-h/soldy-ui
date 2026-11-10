import type { IToggleGroup } from '@soxa-ui/core'
import type { ToggleGroupCollectionDescriptor, ToggleGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type ToggleGroupEventProps = EventProps<typeof ToggleGroupDescriptor> &
	EventProps<typeof ToggleGroupCollectionDescriptor>

export type ToggleGroupProps = UseDomProps<
	typeof ToggleGroupDescriptor,
	IToggleGroup,
	ToggleGroupEventProps
>
