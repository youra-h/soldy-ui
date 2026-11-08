import type { IMenuCheckboxItem } from '@soxa-ui/core'
import type {
	MenuCheckboxItemDescriptor,
	MenuCollectionCheckboxItemDescriptor,
} from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

export type MenuCheckboxItemEventProps = EventProps<typeof MenuCheckboxItemDescriptor> &
	EventProps<typeof MenuCollectionCheckboxItemDescriptor>

/** Атрибуты флажка: класс и стиль — корню, остальное — строке с `role="menuitemcheckbox"`. */
export type MenuCheckboxItemAttributes = TDomAttributes<
	typeof MenuCheckboxItemDescriptor,
	MenuCheckboxItemEventProps
>

export type MenuCheckboxItemProps = UseDomProps<
	typeof MenuCheckboxItemDescriptor,
	IMenuCheckboxItem,
	MenuCheckboxItemEventProps
>
