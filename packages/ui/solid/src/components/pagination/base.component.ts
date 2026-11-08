import type { IPagination } from '@soxa-ui/core'
import type { PaginationCollectionDescriptor, PaginationDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Pagination — свои и фасада коллекции. */
export type PaginationEventProps = EventProps<typeof PaginationDescriptor> &
	EventProps<typeof PaginationCollectionDescriptor>

/** Пропсы Pagination; движок снаружи (`engine`) — в `IPaginationProps`. */
export type PaginationProps = UseDomProps<
	typeof PaginationDescriptor,
	IPagination,
	PaginationEventProps
>
