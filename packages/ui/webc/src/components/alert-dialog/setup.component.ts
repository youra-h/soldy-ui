import { AlertDialogDescriptor, type DescriptorPluginOutputs } from '@soxa-ui/setup'
import type { IAlertDialog } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export type TAlertDialogOutputs = DescriptorPluginOutputs<typeof AlertDialogDescriptor>

export function setupAlertDialog(
	host: HTMLElement,
	ctrl: IAlertDialog | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IAlertDialog, unknown, TAlertDialogOutputs> {
	const adapter = createWebcAdapterContext(host, AlertDialogDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
