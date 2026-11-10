import { CodeBlockDescriptor } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { CodeBlockProps } from './base.component'
export function setupCodeBlock(
	getProps: () => CodeBlockProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const adapter = createSvelteAdapterContext(CodeBlockDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})
	return useAdapter(adapter, getProps, receive)
}
