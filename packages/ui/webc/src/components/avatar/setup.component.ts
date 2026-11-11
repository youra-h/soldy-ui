import { AvatarDescriptor } from '@soxa-ui/setup'
import type { IAvatar } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'

export function setupAvatar(
	host: HTMLElement,
	ctrl: IAvatar | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IAvatar> {
	const adapter = createWebcAdapterContext(host, AvatarDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
