import { CodeBlockDescriptor } from '@soxa-ui/setup'
import {
	useAdapter,
	roleIcon,
	extendBinding,
	useExpose,
	createVueAdapterContext,
	type SetupContext,
} from '../../adapter'
import BaseCodeBlock, { type CodeBlockProps } from './base.component'

export default {
	name: '_CodeBlock',
	extends: BaseCodeBlock,
	expose: useExpose(),
	setup(props: CodeBlockProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(CodeBlockDescriptor(), { ctrl: props.ctrl, props })
		return extendBinding(useAdapter(adapter, props, emit), {
			block: adapter.instance,
			copyIconTag: roleIcon('copy'),
		})
	},
}
