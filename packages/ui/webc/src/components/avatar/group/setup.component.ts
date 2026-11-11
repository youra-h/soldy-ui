import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import type { IAvatarGroup } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../../adapter'
import type { TBinding, TUpdateListener } from '../../../adapter'

export function setupAvatarGroup(
	host: HTMLElement,
	ctrl: IAvatarGroup | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<IAvatarGroup> {
	const adapter = createWebcAdapterContext(host, AvatarGroupDescriptor(), { ctrl, props })

	return useAdapter(adapter, host, onUpdate)
}
