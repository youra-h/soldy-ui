import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import { TDataset, TAria, TAttributes } from '../../../common'
import { sameValue } from '../../../common/utility/same-value'
import { codeLanguage } from './language'
import { codeTokens } from './highlight'
import { TTabs, createEngineTabs } from '../tabs'
import type {
	ICodeBlock,
	ICodeBlockProps,
	TCodeBlockEvents,
	TCodeBlockCopyState,
	ICodeSnippet,
	ICodeBlockLine,
} from './types'

/** Read-only code display. Tabs owns activation and repairs it when snippets disappear. */
export class TCodeBlock extends TStylable<ICodeBlockProps, TCodeBlockEvents> implements ICodeBlock {
	static override baseClass = 'so-code-block'
	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<
			ICodeBlockProps,
			'code' | 'language' | 'title' | 'copyable' | 'lineNumbers' | 'wrap' | 'highlightLines',
			'snippets' | 'value' | 'maxHeight'
		> = {
		...TStylable.defaultValues,
		code: '',
		language: 'text',
		title: '',
		copyable: true,
		lineNumbers: false,
		wrap: false,
		maxHeight: undefined,
		highlightLines: [],
		snippets: undefined,
		value: undefined,
	}

	readonly tabs: TTabs
	readonly engine: ReturnType<typeof createEngineTabs>
	private readonly _contentAttrs = new TAttributes()
	private _contentAria = new TAria()
	private _snippets: readonly ICodeSnippet[] | undefined
	private _copyState: TCodeBlockCopyState = 'idle'
	private _code: string
	private _language: string
	private _title: string
	private _copyable: boolean
	private _lineNumbers: boolean
	private _wrap: boolean
	private _maxHeight: number | string | undefined
	private _highlightLines: readonly number[]

	constructor(props: Partial<ICodeBlockProps> = {}) {
		super(props)
		const ctor = new.target as typeof TCodeBlock

		this._contentAttrs.add('tabindex', '0')
		this._contentAttrs.add('dir', 'ltr')
		this._code = props.code ?? ctor.defaultValues.code
		this._language = props.language ?? ctor.defaultValues.language
		this._title = props.title ?? ctor.defaultValues.title
		this._copyable = props.copyable ?? ctor.defaultValues.copyable
		this._lineNumbers = props.lineNumbers ?? ctor.defaultValues.lineNumbers
		this._wrap = props.wrap ?? ctor.defaultValues.wrap
		this._maxHeight = props.maxHeight ?? ctor.defaultValues.maxHeight
		this._highlightLines = props.highlightLines ?? ctor.defaultValues.highlightLines
		this.tabs = new TTabs({ size: this.size, variant: this.variant })
		this.engine = createEngineTabs({ owner: this.tabs })
		this.engine.extensions.batch.trackBy = (item) => item.value

		this.engine.extensions.activation.events.on('change:activation', (item, previous) => {
			this.copyState = 'idle'
			this._syncDataset()
			this.events.emit('change:value', {
				newValue: typeof item?.value === 'string' ? item.value : undefined,
				oldValue: typeof previous?.value === 'string' ? previous.value : undefined,
			})
		})
		this.events.on('change:size', () => {
			this.tabs.size = this.size
		})
		this.events.on('change:variant', () => {
			this.tabs.variant = this.variant
		})
		this._contentAttrs.subscribe((_set, oldValue) =>
			this.events.emit('change:contentAttrs', {
				newValue: this._contentAttrs.toObject(),
				oldValue,
			}),
		)
		this._contentAria.subscribe((_set, oldValue) =>
			this.events.emit('change:contentAria', {
				newValue: this._contentAria.toObject(),
				oldValue,
			}),
		)
		this._syncDataset()
		this.snippets = props.snippets ?? ctor.defaultValues.snippets
		if (props.value !== undefined) this.value = props.value
	}

	private _syncDataset(): void {
		this._dataset.add('wrap', this.wrap)
		this._dataset.add('line-numbers', this.lineNumbers)
		this._dataset.add('copyable', this.copyable)
		this._dataset.add('tabbed', this.tabbed)
		this._dataset.add('header', Boolean(this.displayTitle) || this.tabbed)
	}

	get code(): string {
		return this._code
	}

	set code(value: string) {
		if (sameValue(this._code, value)) return

		const oldValue = this._code
		this._code = value
		this.copyState = 'idle'
		this._syncDataset()
		this.events.emit('change:code', { newValue: value, oldValue })
	}

	get language(): string {
		return this._language
	}

	set language(value: string) {
		if (sameValue(this._language, value)) return

		const oldValue = this._language
		this._language = value
		this.copyState = 'idle'
		this._syncDataset()
		this.events.emit('change:language', { newValue: value, oldValue })
	}

	get title(): string {
		return this._title
	}

	set title(value: string) {
		if (sameValue(this._title, value)) return

		const oldValue = this._title
		this._title = value

		this._syncDataset()
		this.events.emit('change:title', { newValue: value, oldValue })
	}

	get copyable(): boolean {
		return this._copyable
	}

	set copyable(value: boolean) {
		if (sameValue(this._copyable, value)) return

		const oldValue = this._copyable
		this._copyable = value

		this._syncDataset()
		this.events.emit('change:copyable', { newValue: value, oldValue })
	}

	get lineNumbers(): boolean {
		return this._lineNumbers
	}

	set lineNumbers(value: boolean) {
		if (sameValue(this._lineNumbers, value)) return

		const oldValue = this._lineNumbers
		this._lineNumbers = value

		this._syncDataset()
		this.events.emit('change:lineNumbers', { newValue: value, oldValue })
	}

	get wrap(): boolean {
		return this._wrap
	}

	set wrap(value: boolean) {
		if (sameValue(this._wrap, value)) return

		const oldValue = this._wrap
		this._wrap = value

		this._syncDataset()
		this.events.emit('change:wrap', { newValue: value, oldValue })
	}

	get maxHeight(): number | string | undefined {
		return this._maxHeight
	}

	set maxHeight(value: number | string | undefined) {
		if (sameValue(this._maxHeight, value)) return

		const oldValue = this._maxHeight
		this._maxHeight = value

		this._syncDataset()
		this.events.emit('change:maxHeight', { newValue: value, oldValue })
	}

	get highlightLines(): readonly number[] {
		return this._highlightLines
	}

	set highlightLines(value: readonly number[]) {
		if (sameValue(this._highlightLines, value)) return

		const oldValue = this._highlightLines
		this._highlightLines = value

		this._syncDataset()
		this.events.emit('change:highlightLines', { newValue: value, oldValue })
	}

	get snippets(): readonly ICodeSnippet[] | undefined {
		return this._snippets
	}

	set snippets(value: readonly ICodeSnippet[] | undefined) {
		if (sameValue(this._snippets, value)) return

		if (value && new Set(value.map((snippet) => snippet.value)).size !== value.length) {
			throw new Error('CodeBlock snippets must have unique values.')
		}

		const oldValue = this._snippets
		this._snippets = value?.map((snippet) => ({
			...snippet,
			highlightLines: snippet.highlightLines?.slice(),
		}))
		this.copyState = 'idle'
		// Patch by value preserves surviving tab instances, activation and ARIA links.
		this.engine.extensions.batch.update(
			(value ?? []).map((snippet) => ({ value: snippet.value, text: snippet.label })),
		)
		if (!this.engine.extensions.activation.activeItem) {
			const first = this.engine.extensions.activation.findActivatable()
			if (first) this.engine.extensions.activation.activate(first)
		}
		this._syncDataset()
		this.events.emit('change:snippets', { newValue: this.snippets, oldValue })
	}

	get value(): string | undefined {
		const value = this.engine.extensions.activation.activeItem?.value
		return typeof value === 'string' ? value : undefined
	}

	set value(value: string | undefined) {
		const item =
			value === undefined
				? this.engine.extensions.activation.findActivatable()
				: this.engine.extensions.batch.find((item) => item.value === value)
		if (item) this.engine.extensions.activation.activate(item)
	}

	get copyState(): TCodeBlockCopyState {
		return this._copyState
	}

	set copyState(value: TCodeBlockCopyState) {
		if (value === this._copyState) return

		const oldValue = this._copyState
		this._copyState = value
		this.events.emit('change:copyState', { newValue: value, oldValue })
	}

	get tabbed(): boolean {
		return this.snippets !== undefined
	}
	private get _active(): ICodeSnippet | undefined {
		return this.snippets?.find((snippet) => snippet.value === this.value)
	}
	get source(): string {
		return this.tabbed ? (this._active?.code ?? '') : this.code
	}
	get displayTitle(): string {
		return this.title || this._active?.filename || ''
	}
	get contentAttrs(): TAttributes {
		return this._contentAttrs
	}

	get contentAria(): TAria {
		return this._contentAria
	}

	get copyDisabled(): boolean {
		return !this.source || this.copyState === 'pending'
	}
	get contentStyle(): { 'max-height': string } {
		return {
			'max-height':
				typeof this.maxHeight === 'number'
					? Math.max(0, this.maxHeight) + 'px'
					: (this.maxHeight ?? ''),
		}
	}

	private _lines(
		code: string,
		highlighted: readonly number[],
		language: string,
	): readonly ICodeBlockLine[] {
		// Preserve the original endings and the final empty logical line.
		const parts = code.split(/(\r\n|\r|\n)/)
		const marked = new Set(highlighted)
		const tokens = codeTokens(code, language)
		const lines: ICodeBlockLine[] = []

		for (let index = 0; index < parts.length; index += 2) {
			const number = index / 2 + 1
			const dataset = new TDataset()
			dataset.add('highlighted', marked.has(number))
			lines.push({
				number,
				text: parts[index] + (parts[index + 1] ?? ''),
				tokens: tokens[number - 1],
				dataset: dataset.toObject(),
			})
		}
		return lines
	}

	get lines(): readonly ICodeBlockLine[] {
		return this._lines(
			this.source,
			this._active?.highlightLines ?? this.highlightLines,
			this._active?.language ?? this.language,
		)
	}
	private _codeDataset(language: string) {
		const dataset = new TDataset()
		dataset.add('language', codeLanguage(language))
		return dataset.toObject()
	}

	get codeDataset() {
		return this._codeDataset(this._active?.language ?? this.language)
	}

	get panels() {
		return (this.snippets ?? []).map((snippet) => ({
			value: snippet.value,
			dataset: this._codeDataset(snippet.language ?? this.language),
			lines: this._lines(
				snippet.code,
				snippet.highlightLines ?? this.highlightLines,
				snippet.language ?? this.language,
			),
		}))
	}

	/** Ask the mounted browser plugin to copy a snapshot, never reconstructed DOM text. */
	copy(): void {
		if (!this.copyable || this.copyDisabled) return

		this.events.emit('copy:request', {
			value: this.tabbed ? this.value : undefined,
			code: this.source,
		})
	}

	override getProps(): ICodeBlockProps {
		return {
			...super.getProps(),
			code: this.code,
			language: this.language,
			title: this.title,
			copyable: this.copyable,
			lineNumbers: this.lineNumbers,
			wrap: this.wrap,
			maxHeight: this.maxHeight,
			highlightLines: this.highlightLines,
			snippets: this.snippets,
			value: this.value,
		}
	}
}
