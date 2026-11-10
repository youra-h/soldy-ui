import type { HTMLAttributes } from 'react'
import type { IBreadcrumbsItem } from '@soxa-ui/core'
import type { BreadcrumbsCollectionItemDescriptor, BreadcrumbsItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

export type BreadcrumbsItemEventProps = EventProps<typeof BreadcrumbsItemDescriptor> &
	EventProps<typeof BreadcrumbsCollectionItemDescriptor>

export type BreadcrumbsItemAttributes = TDomAttributes<
	typeof BreadcrumbsItemDescriptor,
	HTMLAttributes<HTMLElement>,
	BreadcrumbsItemEventProps
>

export type BreadcrumbsItemProps = UseDomProps<
	typeof BreadcrumbsItemDescriptor,
	IBreadcrumbsItem,
	BreadcrumbsItemEventProps
>
