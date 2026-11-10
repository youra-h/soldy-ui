import { CodeBlockDescriptor } from '@soxa-ui/setup'
import type { ICodeBlock } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter } from '../../adapter'
import type { TBinding, TUpdateListener } from '../../adapter'
export function setupCodeBlock(
	host: HTMLElement,
	ctrl: ICodeBlock | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
): TBinding<ICodeBlock> {
	return useAdapter(
		createWebcAdapterContext(host, CodeBlockDescriptor(), { ctrl, props }),
		host,
		onUpdate,
	)
}
