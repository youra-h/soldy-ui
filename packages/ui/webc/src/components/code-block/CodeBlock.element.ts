import { CodeBlockDescriptor } from '@soxa-ui/setup'
import type { ICodeBlock } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { codeBlockTemplate } from './code-block.template'
import { setupCodeBlock } from './setup.component'
export const TCodeBlockElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof CodeBlockDescriptor,
	ICodeBlock
> = ElementBase(HTMLDivElement, {
	descriptor: CodeBlockDescriptor,
	template: codeBlockTemplate,
	setup: setupCodeBlock,
})
defineElement('so-code-block', TCodeBlockElement, 'div')
export type TCodeBlockElementProps = TElementType<typeof TCodeBlockElement>
