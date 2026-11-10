import type { HTMLButtonAttributes } from 'svelte/elements'
import type { IToggleGroupItem } from '@soxa-ui/core'
import type { ToggleGroupItemDescriptor, ToggleGroupCollectionItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type ToggleGroupItemEventProps = EventProps<typeof ToggleGroupItemDescriptor> &
	EventProps<typeof ToggleGroupCollectionItemDescriptor>

/** Атрибуты — кнопки: корень по умолчанию — `<button>`. */
export type ToggleGroupItemProps = UseDomProps<
	typeof ToggleGroupItemDescriptor,
	IToggleGroupItem,
	ToggleGroupItemEventProps,
	HTMLButtonAttributes
>
