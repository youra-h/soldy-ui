import type { IPaginationItem } from '@soxa-ui/core'
import type { PaginationCollectionItemDescriptor, PaginationItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type PaginationItemEventProps = EventProps<typeof PaginationItemDescriptor> &
	EventProps<typeof PaginationCollectionItemDescriptor>

/** Внутренняя часть пагинации: наружу пакета не выходит. */
export type PaginationItemProps = UseDomProps<
	typeof PaginationItemDescriptor,
	IPaginationItem,
	PaginationItemEventProps
>
