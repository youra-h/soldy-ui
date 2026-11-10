import { CodeBlockDescriptor } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { CodeBlockProps } from './base.component'
export function setupCodeBlock(props: CodeBlockProps) {
	const adapter = createSolidAdapterContext(CodeBlockDescriptor(), { ctrl: props.ctrl, props })
	return useAdapter(adapter, props)
}
