import { ListBoxGroupDescriptor, TItemGroupExtension } from '@soxa-ui/setup'
import type { IItemGroup } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding } from '../../../adapter'

/** Ключ группы элементы внутри читают при своей сборке: `ngOnInit` группы идёт раньше. */
export function setupListBoxGroup(
	ctrl: IItemGroup | undefined,
	props: object,
): TBinding<IItemGroup> {
	const adapter = createAngularAdapterContext(ListBoxGroupDescriptor(), { ctrl, props }).use(
		TItemGroupExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
