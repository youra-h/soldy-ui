import type { IValueControl } from '@soxa-ui/core'
import type { ValueControlDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

export type ValueControlEventProps = EventProps<typeof ValueControlDescriptor>

/** Тип значения задаёт наследник. */
export type ValueControlProps = UseProps<
	typeof ValueControlDescriptor,
	IValueControl<unknown>,
	ValueControlEventProps
>
