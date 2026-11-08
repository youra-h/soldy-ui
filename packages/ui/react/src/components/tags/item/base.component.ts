import type { HTMLAttributes } from 'react'
import type { ITagsItem } from '@soxa-ui/core'
import type { TagsCollectionItemDescriptor, TagsItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

export type TagsItemEventProps = EventProps<typeof TagsItemDescriptor> &
	EventProps<typeof TagsCollectionItemDescriptor>

/** Атрибуты тега: класс и стиль — корню, остальное — строке. */
export type TagsItemAttributes = TDomAttributes<
	typeof TagsItemDescriptor,
	HTMLAttributes<HTMLElement>,
	TagsItemEventProps
>

export type TagsItemProps = UseDomProps<typeof TagsItemDescriptor, ITagsItem, TagsItemEventProps>
