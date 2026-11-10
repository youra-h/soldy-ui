import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { CodeBlockDescriptor } from '@soxa-ui/setup'
import type { ICodeBlock } from '@soxa-ui/core'

export const emitsCodeBlock: TEmits = useEmits(CodeBlockDescriptor())
export const propsCodeBlock: TProps = useProps(CodeBlockDescriptor()) as TProps
export type CodeBlockProps = UseProps<typeof CodeBlockDescriptor, ICodeBlock>
export default { name: 'BaseCodeBlock', emits: emitsCodeBlock, props: propsCodeBlock }
