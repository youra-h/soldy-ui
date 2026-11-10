import { CodeBlockDescriptor } from '@soxa-ui/setup'
import type { ICodeBlock } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'
export function setupCodeBlock(ctrl: ICodeBlock | undefined, props: object): TBinding<ICodeBlock> {
	return useAdapter(createAngularAdapterContext(CodeBlockDescriptor(), { ctrl, props }))
}
