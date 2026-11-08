import { RatingDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { IRating } from '@soxa-ui/core'
import { AngularElevatorFactory, createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

/** Поле формы `Field` над оценкой связывает расширение `TFieldControlExtension`. */
export function setupRating(ctrl: IRating | undefined, props: object): TBinding<IRating> {
	const adapter = createAngularAdapterContext(RatingDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: AngularElevatorFactory },
	)

	return useAdapter(adapter)
}
