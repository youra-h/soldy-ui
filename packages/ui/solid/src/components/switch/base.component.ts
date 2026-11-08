import type { ISwitch } from '@soxa-ui/core'
import type { SwitchDescriptor } from '@soxa-ui/setup'
import type { EventProps, TDomAttributes, TFieldAttributes, UseDomProps } from '../../types'

/** События слоя Switch (core + плагины), выведены из дескриптора автоматически. */
export type SwitchEventProps = EventProps<typeof SwitchDescriptor>

/** Атрибуты Switch: класс и стиль — корню, остальное — полю `<input>`. */
export type SwitchAttributes = TDomAttributes<
	typeof SwitchDescriptor,
	SwitchEventProps,
	TFieldAttributes
>

export type SwitchProps = UseDomProps<
	typeof SwitchDescriptor,
	ISwitch,
	SwitchEventProps,
	TFieldAttributes
>
