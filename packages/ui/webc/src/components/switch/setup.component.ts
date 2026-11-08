import { SwitchDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { ISwitch } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TSwitchOutputs = DescriptorPluginProps<typeof SwitchDescriptor>

export function setupSwitch(
	host: HTMLElement,
	ctrl: ISwitch | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ISwitch, unknown, TSwitchOutputs> {
	const adapter = createWebcAdapterContext(host, SwitchDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
