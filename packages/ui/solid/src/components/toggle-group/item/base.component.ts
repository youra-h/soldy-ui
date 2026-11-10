import type { JSX } from 'solid-js'
import type { IToggleGroupItem } from '@soxa-ui/core'
import type { ToggleGroupItemDescriptor, ToggleGroupCollectionItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События слоя Button (core + плагины), выведены из дескриптора автоматически. */
export type ToggleGroupItemEventProps = EventProps<typeof ToggleGroupItemDescriptor> &
	EventProps<typeof ToggleGroupCollectionItemDescriptor>

/** Атрибуты — кнопки (корень по умолчанию `<button>`), элемент — `HTMLElement`: `tag` свободен. */
export type ToggleGroupItemProps = UseDomProps<
	typeof ToggleGroupItemDescriptor,
	IToggleGroupItem,
	ToggleGroupItemEventProps,
	JSX.ButtonHTMLAttributes<HTMLElement>
>
