import { SliderDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { ISlider } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Поле формы `Field` над ползунком связывает расширение `TFieldControlExtension`. */
export function setupSlider(ctrl: ISlider | undefined, props: object): TBinding<ISlider> {
	const adapter = createAngularAdapterContext(SliderDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
