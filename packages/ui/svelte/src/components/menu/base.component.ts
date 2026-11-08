import type { IMenu } from '@soxa-ui/core'
import type { MenuCollectionDescriptor, MenuDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type MenuEventProps = EventProps<typeof MenuDescriptor> &
	EventProps<typeof MenuCollectionDescriptor>

/** Атрибуты — обёртке триггера, как у Popover: ARIA меню — у панели. */
export type MenuProps = UseDomProps<typeof MenuDescriptor, IMenu, MenuEventProps>
