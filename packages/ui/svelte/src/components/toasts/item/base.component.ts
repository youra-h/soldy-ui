import type { IToastsItem } from '@soxa-ui/core'
import type { ToastsCollectionItemDescriptor, ToastsItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type ToastsItemEventProps = EventProps<typeof ToastsItemDescriptor> &
	EventProps<typeof ToastsCollectionItemDescriptor>

/** Внутренняя часть менеджера: наружу пакета не выходит. */
export type ToastsItemProps = UseDomProps<
	typeof ToastsItemDescriptor,
	IToastsItem,
	ToastsItemEventProps
>
