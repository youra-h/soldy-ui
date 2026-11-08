import { SwitchDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { ISwitch } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Поле формы `Field` над переключателем связывает расширение `TFieldControlExtension`. */
export function setupSwitch(ctrl: ISwitch | undefined, props: object): TBinding<ISwitch> {
	const adapter = createAngularAdapterContext(SwitchDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
