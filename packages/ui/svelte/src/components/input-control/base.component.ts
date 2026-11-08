import type { IInputControl } from '@soxa-ui/core'
import type { InputControlDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type InputControlEventProps = EventProps<typeof InputControlDescriptor>

/** Тип значения сужает наследник. */
export type InputControlProps = UseProps<
	typeof InputControlDescriptor,
	IInputControl<unknown>,
	InputControlEventProps
>
