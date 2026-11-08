import type { IToastsItem } from '@soxa-ui/core'
import type { ToastsCollectionItemDescriptor, ToastsItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События тоста — свои и фасада. */
export type ToastsItemEventProps = EventProps<typeof ToastsItemDescriptor> &
	EventProps<typeof ToastsCollectionItemDescriptor>

export type ToastsItemProps = UseDomProps<
	typeof ToastsItemDescriptor,
	IToastsItem,
	ToastsItemEventProps
>
