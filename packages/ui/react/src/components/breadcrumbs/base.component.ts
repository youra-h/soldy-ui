import type { IBreadcrumbs } from '@soxa-ui/core'
import type { BreadcrumbsDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'
export type BreadcrumbsEventProps = EventProps<typeof BreadcrumbsDescriptor>
export type BreadcrumbsProps = UseDomProps<
	typeof BreadcrumbsDescriptor,
	IBreadcrumbs,
	BreadcrumbsEventProps
>
