import { RatingDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { IRating } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TRatingOutputs = DescriptorPluginProps<typeof RatingDescriptor>

export function setupRating(
	host: HTMLElement,
	ctrl: IRating | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IRating, unknown, TRatingOutputs> {
	const adapter = createWebcAdapterContext(host, RatingDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
