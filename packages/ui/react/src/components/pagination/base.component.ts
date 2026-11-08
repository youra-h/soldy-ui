import type { IPagination } from '@soxa-ui/core'
import type { PaginationCollectionDescriptor, PaginationDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** Колбэки обоих контекстов пагинации — свой и фасада коллекции — пропсы одного компонента. */
export type PaginationEventProps = EventProps<typeof PaginationDescriptor> &
	EventProps<typeof PaginationCollectionDescriptor>

export type PaginationProps = UseDomProps<
	typeof PaginationDescriptor,
	IPagination,
	PaginationEventProps
>
