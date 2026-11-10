import type { JSX } from 'solid-js'
import type { IToggleGroupItem } from '@soxa-ui/core'
import type { ToggleGroupItemDescriptor, ToggleGroupCollectionItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** Component, plugin and collection events are inferred from their descriptors. */
export type ToggleGroupItemEventProps = EventProps<typeof ToggleGroupItemDescriptor> &
	EventProps<typeof ToggleGroupCollectionItemDescriptor>

/** Native button attributes; tag may select another HTMLElement. */
export type ToggleGroupItemProps = UseDomProps<
	typeof ToggleGroupItemDescriptor,
	IToggleGroupItem,
	ToggleGroupItemEventProps,
	JSX.ButtonHTMLAttributes<HTMLElement>
>
