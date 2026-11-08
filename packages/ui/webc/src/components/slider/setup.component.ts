import { SliderDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { ISlider } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

export function setupSlider(
	host: HTMLElement,
	ctrl: ISlider | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ISlider> {
	// Своего канала `id` нет: `id` от `Field` ядро кладёт в `aria`, у одной ручки — до её поля
	const adapter = createWebcAdapterContext(host, SliderDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
