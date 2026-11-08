import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { DatePickerDescriptor } from '@soxa-ui/setup'
import type { IDatePicker } from '@soxa-ui/core'

export const emitsDatePicker: TEmits = useEmits(DatePickerDescriptor())

export const propsDatePicker: TProps = useProps(DatePickerDescriptor()) as TProps

export type DatePickerProps = UseProps<typeof DatePickerDescriptor, IDatePicker>

export default {
	name: 'BaseDatePicker',
	emits: emitsDatePicker,
	props: propsDatePicker,
}
