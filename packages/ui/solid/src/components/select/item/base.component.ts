import type { ISelectItem } from '@soxa-ui/core'
import type { SelectCollectionItemDescriptor, SelectItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, UseDomProps } from '../../../types'

/** События опции — свои (ядро и плагины) и фасада: выбор, порядок, сторона отметки. */
export type SelectItemEventProps = EventProps<typeof SelectItemDescriptor> &
	EventProps<typeof SelectCollectionItemDescriptor>

/** Атрибуты опции: класс и стиль — корню, остальное — строке с `role="option"`. */
export type SelectItemAttributes = TDomAttributes<typeof SelectItemDescriptor, SelectItemEventProps>

/** Пропсы опции; членство в коллекции (`selected`) несёт интерфейс ядра. */
export type SelectItemProps = UseDomProps<
	typeof SelectItemDescriptor,
	ISelectItem,
	SelectItemEventProps
>
