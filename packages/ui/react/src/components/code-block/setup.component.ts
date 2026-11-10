import { CodeBlockDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { CodeBlockProps } from './base.component'
export function useSetupCodeBlock(props: CodeBlockProps) {
	return useComponent(
		(create) => create(CodeBlockDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}
