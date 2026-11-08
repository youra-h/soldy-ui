import { NumberInputDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { INumberInput } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TNumberInputOutputs = DescriptorPluginProps<typeof NumberInputDescriptor>

export function setupNumberInput(
	host: HTMLElement,
	ctrl: INumberInput | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<INumberInput, unknown, TNumberInputOutputs> {
	const adapter = createWebcAdapterContext(host, NumberInputDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
