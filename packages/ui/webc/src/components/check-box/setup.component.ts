import { CheckBoxDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { ICheckBox } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TCheckBoxOutputs = DescriptorPluginProps<typeof CheckBoxDescriptor>

export function setupCheckBox(
	host: HTMLElement,
	ctrl: ICheckBox | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ICheckBox, unknown, TCheckBoxOutputs> {
	const adapter = createWebcAdapterContext(host, CheckBoxDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
