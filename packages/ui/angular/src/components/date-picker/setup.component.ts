import { DatePickerDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { IDatePicker } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** DatePicker: связку `Field` берёт из слоя над собой, а своему содержимому опускает пустую. */
export function setupDatePicker(
	ctrl: IDatePicker | undefined,
	props: object,
): TBinding<IDatePicker> {
	const adapter = createAngularAdapterContext(DatePickerDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
