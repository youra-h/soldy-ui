import { TextareaDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import type { DescriptorPluginProps } from '@soxa-ui/setup'
import type { ITextarea } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
import { createWebcElevator } from '../../adapter/elevator'

/** Сверх инстанса шаблон читает входы плагинов: `id` поля — проп `TIdPlugin`. */
export type TTextareaOutputs = DescriptorPluginProps<typeof TextareaDescriptor>

export function setupTextarea(
	host: HTMLElement,
	ctrl: ITextarea | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ITextarea, unknown, TTextareaOutputs> {
	const adapter = createWebcAdapterContext(host, TextareaDescriptor(), { ctrl, props }).use(
		TFieldControlExtension,
		{ elevator: createWebcElevator(host) },
	)

	return useAdapter(adapter, host, onUpdate)
}
