import { DrawerDescriptor, type DescriptorPluginOutputs } from '@soxa-ui/setup'
import type { IDrawer } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

/** Выходы плагинов Drawer — их читает шаблон: стиль подложки и пометку панели владельцем. */
export type TDrawerOutputs = DescriptorPluginOutputs<typeof DrawerDescriptor>

export function setupDrawer(
	host: HTMLElement,
	ctrl: IDrawer | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IDrawer, unknown, TDrawerOutputs> {
	const adapter = createWebcAdapterContext(host, DrawerDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
