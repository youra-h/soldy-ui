import type { IStylable, IStylableProps, TStylableEvents } from '../../base/stylable'
import type {
	TAttributes,
	TAttributesMap,
	TValuePayload,
	TDatasetAttributes,
	TAria,
	TAriaAttributes,
} from '../../../common'
import type { ITabs, TTabsCollection } from '../tabs'

/** A source fragment; its value identifies the corresponding Tabs item. */
export interface ICodeSnippet {
	value: string
	label: string
	code: string
	language?: string
	filename?: string
	/** One-based logical lines; invalid or out-of-range numbers have no effect. */
	highlightLines?: readonly number[]
}

export type TCodeBlockCopyState = 'idle' | 'pending' | 'success' | 'error'
export interface ICodeBlockCopy {
	readonly value: string | undefined
	readonly code: string
}
export interface ICodeBlockCopyError extends ICodeBlockCopy {
	readonly error: unknown
}
export interface ICodeBlockLine {
	readonly number: number
	readonly text: string
	readonly dataset: TDatasetAttributes
}
export interface ICodeBlockPanel {
	readonly value: string
	readonly lines: readonly ICodeBlockLine[]
	readonly dataset: TDatasetAttributes
}
export interface ICodeBlockProps extends IStylableProps {
	/** Exact source and original line endings; snippets takes precedence when supplied. */
	code?: string
	/** Language metadata; unknown names render as plain text without requiring a highlighter. */
	language?: string
	title?: string
	/** Omit for a single block; an empty array is an empty tabbed block. */
	snippets?: readonly ICodeSnippet[]
	/** The current Tabs activation, rather than a second stored selection. */
	value?: string
	copyable?: boolean
	lineNumbers?: boolean
	wrap?: boolean
	/** Pixels as a number, or a CSS length. Only the code scrolls, never its header. */
	maxHeight?: number | string
	highlightLines?: readonly number[]
}
export type TCodeBlockEvents = TStylableEvents & {
	'change:code': (payload: TValuePayload<string>) => void
	'change:language': (payload: TValuePayload<string>) => void
	'change:title': (payload: TValuePayload<string>) => void
	'change:snippets': (payload: TValuePayload<readonly ICodeSnippet[] | undefined>) => void
	'change:value': (payload: TValuePayload<string | undefined>) => void
	'change:copyable': (payload: TValuePayload<boolean>) => void
	'change:lineNumbers': (payload: TValuePayload<boolean>) => void
	'change:wrap': (payload: TValuePayload<boolean>) => void
	'change:maxHeight': (payload: TValuePayload<number | string | undefined>) => void
	'change:highlightLines': (payload: TValuePayload<readonly number[]>) => void
	'change:copyState': (payload: TValuePayload<TCodeBlockCopyState>) => void
	'change:contentAttrs': (payload: TValuePayload<TAttributesMap>) => void
	'change:contentAria': (payload: TValuePayload<TAriaAttributes>) => void
	'copy:request': (payload: ICodeBlockCopy) => void
	copy: (payload: ICodeBlockCopy) => void
	'copy:error': (payload: ICodeBlockCopyError) => void
}
export interface ICodeBlock extends IStylable<ICodeBlockProps, TCodeBlockEvents> {
	code: string
	language: string
	title: string
	snippets: readonly ICodeSnippet[] | undefined
	value: string | undefined
	copyable: boolean
	lineNumbers: boolean
	wrap: boolean
	maxHeight: number | string | undefined
	highlightLines: readonly number[]
	copyState: TCodeBlockCopyState
	readonly tabs: ITabs
	readonly engine: TTabsCollection
	readonly tabbed: boolean
	readonly source: string
	readonly displayTitle: string
	readonly lines: readonly ICodeBlockLine[]
	readonly codeDataset: TDatasetAttributes
	readonly panels: readonly ICodeBlockPanel[]
	readonly contentAttrs: TAttributes
	readonly contentAria: TAria
	readonly copyDisabled: boolean
	readonly contentStyle: { 'max-height': string }
	copy(): void
}
