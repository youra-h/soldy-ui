import type { ButtonHTMLAttributes } from 'react'
import type { IToggleGroupItem } from '@soxa-ui/core'
import type { ToggleGroupItemDescriptor, ToggleGroupCollectionItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type ToggleGroupItemEventProps = EventProps<typeof ToggleGroupItemDescriptor> &
	EventProps<typeof ToggleGroupCollectionItemDescriptor>

/** Атрибуты — кнопки (корень по умолчанию `<button>`), элемент — `HTMLElement`: `tag` свободен. */
export type ToggleGroupItemProps = UseDomProps<
	typeof ToggleGroupItemDescriptor,
	IToggleGroupItem,
	ToggleGroupItemEventProps,
	ButtonHTMLAttributes<HTMLElement>
>
