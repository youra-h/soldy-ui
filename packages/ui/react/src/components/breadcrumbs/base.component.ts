import type { HTMLAttributes } from 'react'
import type { IBreadcrumbs } from '@soxa-ui/core'
import type { BreadcrumbsCollectionDescriptor, BreadcrumbsDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../types'

export type BreadcrumbsEventProps = EventProps<typeof BreadcrumbsDescriptor> &
	EventProps<typeof BreadcrumbsCollectionDescriptor>

export type BreadcrumbsAttributes = TDomAttributes<
	typeof BreadcrumbsDescriptor,
	HTMLAttributes<HTMLElement>,
	BreadcrumbsEventProps
>

export type BreadcrumbsProps = UseDomProps<
	typeof BreadcrumbsDescriptor,
	IBreadcrumbs,
	BreadcrumbsEventProps
>
