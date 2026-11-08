import { DateInputDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { IDateInput } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Поле формы `Field` над полем связывает расширение `TFieldControlExtension`. */
export function setupDateInput(ctrl: IDateInput | undefined, props: object): TBinding<IDateInput> {
	const adapter = createAngularAdapterContext(DateInputDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
