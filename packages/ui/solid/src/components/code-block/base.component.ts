import type { ICodeBlock } from '@soxa-ui/core'
import type { CodeBlockDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'
export type CodeBlockEventProps = EventProps<typeof CodeBlockDescriptor>
export type CodeBlockProps = UseDomProps<
	typeof CodeBlockDescriptor,
	ICodeBlock,
	CodeBlockEventProps
>
