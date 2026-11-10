import type { TClosedComponent } from '../../adapter'
import CodeBlockComponent from './CodeBlock.vue'
export const CodeBlock: TClosedComponent<typeof CodeBlockComponent> = CodeBlockComponent
export { default as BaseCodeBlock, emitsCodeBlock, propsCodeBlock } from './base.component'
export type { CodeBlockProps } from './base.component'
