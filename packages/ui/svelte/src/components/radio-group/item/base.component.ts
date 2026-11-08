import type { IRadioGroupItem } from '@soxa-ui/core'
import type { RadioGroupCollectionItemDescriptor, RadioGroupItemDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, TFieldAttributes, UseDomProps } from '../../../types'

export type RadioGroupItemEventProps = EventProps<typeof RadioGroupItemDescriptor> &
	EventProps<typeof RadioGroupCollectionItemDescriptor>

/** Атрибуты радио: класс и стиль — корню, остальное — полю `<input type="radio">`. */
export type RadioGroupItemAttributes = TDomAttributes<
	typeof RadioGroupItemDescriptor,
	RadioGroupItemEventProps,
	TFieldAttributes
>

/** `name`, `size`, `variant` и `view` раздаёт группа. */
export type RadioGroupItemProps = UseDomProps<
	typeof RadioGroupItemDescriptor,
	IRadioGroupItem,
	RadioGroupItemEventProps,
	TFieldAttributes
>
