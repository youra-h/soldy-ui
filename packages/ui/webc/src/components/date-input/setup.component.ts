import { DateInputDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { IDateInput } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Поле-деталь (`embedded`: поля DatePicker) связку `Field` не берёт: её взял владелец. */
/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TDateInputOutputs = DescriptorPluginProps<typeof DateInputDescriptor>

export function setupDateInput(
	host: HTMLElement,
	ctrl: IDateInput | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IDateInput, unknown, TDateInputOutputs> {
	const adapter = createWebcAdapterContext(host, DateInputDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
