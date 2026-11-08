import { TextareaDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { ITextarea } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Поле формы `Field` над полем связывает расширение `TFieldControlExtension`. */
export function setupTextarea(ctrl: ITextarea | undefined, props: object): TBinding<ITextarea> {
	const adapter = createAngularAdapterContext(TextareaDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
