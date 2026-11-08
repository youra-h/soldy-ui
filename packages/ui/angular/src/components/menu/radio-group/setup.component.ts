import {
	MenuRadioGroupDescriptor,
	TItemGroupExtension,
	TMenuRadioGroupExtension,
} from '@soxa-ui/setup'
import type { IMenuRadioGroup } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding } from '../../../adapter'

/** Группа переключателей — группа меню, которая ещё опускает себя переключателям. */
export function setupMenuRadioGroup(
	ctrl: IMenuRadioGroup | undefined,
	props: object,
): TBinding<IMenuRadioGroup> {
	const adapter = createAngularAdapterContext(MenuRadioGroupDescriptor(), { ctrl, props })
		.use(TItemGroupExtension, { elevator: AngularElevatorFactory })
		.use(TMenuRadioGroupExtension, { elevator: AngularElevatorFactory })

	return useAdapter(adapter)
}
