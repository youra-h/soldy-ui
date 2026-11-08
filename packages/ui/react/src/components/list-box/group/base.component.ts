import type { IItemGroup } from '@soxa-ui/core'
import type { ListBoxGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type ListBoxGroupEventProps = EventProps<typeof ListBoxGroupDescriptor>

/** Пропсы группы: подпись — проп `label`, элементы — дети. */
export type ListBoxGroupProps = UseDomProps<
	typeof ListBoxGroupDescriptor,
	IItemGroup,
	ListBoxGroupEventProps
>
