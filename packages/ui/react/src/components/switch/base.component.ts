import type { ISwitch } from '@soxa-ui/core'
import type { SwitchDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, TFieldAttributes, UseDomProps } from '../../types'

export type SwitchEventProps = EventProps<typeof SwitchDescriptor>

/** Атрибуты Switch: класс и стиль — корню, остальное — полю `<input>`. */
export type SwitchAttributes = TDomAttributes<typeof SwitchDescriptor, TFieldAttributes>

export type SwitchProps = UseDomProps<
	typeof SwitchDescriptor,
	ISwitch,
	SwitchEventProps,
	TFieldAttributes
>
