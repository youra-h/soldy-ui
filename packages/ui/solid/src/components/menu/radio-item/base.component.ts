import type { IMenuRadioItem } from '@soxa-ui/core'
import type { MenuCollectionRadioItemDescriptor, MenuRadioItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

/** События переключателя — свои (ядро и плагины) и фасада: отметка — выбор коллекции меню. */
export type MenuRadioItemEventProps = EventProps<typeof MenuRadioItemDescriptor> &
	EventProps<typeof MenuCollectionRadioItemDescriptor>

/** Атрибуты переключателя: класс и стиль — корню, остальное — строке с `role="menuitemradio"`. */
export type MenuRadioItemAttributes = TDomAttributes<
	typeof MenuRadioItemDescriptor,
	MenuRadioItemEventProps
>

/** Пропсы переключателя; группу пишет проводка — ближайшая `Menu.RadioGroup`. */
export type MenuRadioItemProps = UseDomProps<
	typeof MenuRadioItemDescriptor,
	IMenuRadioItem,
	MenuRadioItemEventProps
>
