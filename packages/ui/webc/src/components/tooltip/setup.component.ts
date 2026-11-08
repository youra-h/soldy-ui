import { TooltipDescriptor, type DescriptorPluginOutputs } from '@soxa-ui/setup'
import type { ITooltip } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

/** Выходы плагинов Tooltip — их читает шаблон: пометку панели владельцем. */
export type TTooltipOutputs = DescriptorPluginOutputs<typeof TooltipDescriptor>

export function setupTooltip(
	host: HTMLElement,
	ctrl: ITooltip | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ITooltip, unknown, TTooltipOutputs> {
	const adapter = createWebcAdapterContext(host, TooltipDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
