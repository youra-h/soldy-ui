import type { IInput } from '@soxa-ui/core'
import type { InputDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, TFieldAttributes, UseDomProps } from '../../types'

export type InputEventProps = EventProps<typeof InputDescriptor>

/** Атрибуты Input: класс и стиль — корню, остальное — полю `<input>`. */
export type InputAttributes = TDomAttributes<
	typeof InputDescriptor,
	InputEventProps,
	TFieldAttributes
>

export type InputProps = UseDomProps<
	typeof InputDescriptor,
	IInput,
	InputEventProps,
	TFieldAttributes
>
