import { InputControlDescriptor } from '@soxa-ui/setup'
import type { IInputControl } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

/** Тип значения сужает наследник: поле ввода — текстом, оценка — числом. */
export function setupInputControl(
	host: HTMLElement,
	ctrl: IInputControl<unknown> | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IInputControl<unknown>> {
	const adapter = createWebcAdapterContext(host, InputControlDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
