import type { ICodeBlock, ICodeBlockLine, ICodeBlockPanel, TDatasetAttributes } from '@soxa-ui/core'
import type { CodeBlockDescriptor, DescriptorPluginOutputs } from '@soxa-ui/setup'
import {
	bind,
	createDetail,
	lend,
	lendMark,
	lendBefore,
	TKeyedLoop,
	ownerAttributes,
	patch,
	type ITemplate,
	type ITemplateContext,
} from '../../adapter'
import { TButtonElement, type TButtonElementProps } from '../button'
import {
	TTabsElement,
	TTabsContentElement,
	type TTabsElementProps,
	type TTabsContentElementProps,
} from '../tabs'

type TOutputs = DescriptorPluginOutputs<typeof CodeBlockDescriptor>
type TContext = ITemplateContext<ICodeBlock, unknown, TOutputs>
type TParts = {
	readonly header: HTMLElement
	readonly title: HTMLElement
	readonly tabs: TTabsElementProps
	readonly body: HTMLElement
	readonly pre: HTMLPreElement
	readonly copy: TButtonElementProps
	readonly status: HTMLElement
	readonly trailing: Comment
	readonly panels: TKeyedLoop<ICodeBlockPanel, string, TTabsContentElementProps>
}
const parts = new WeakMap<HTMLElement, TParts>()
// Inactive Tabs.Content detaches its light; querying the DOM would create a second pre.
const panelPres = new WeakMap<HTMLElement, HTMLPreElement>()

function preOf(doc: Document): HTMLPreElement {
	const pre = doc.createElement('pre')
	pre.className = 'so-code-block__pre'
	pre.setAttribute('role', 'region')
	return pre
}

function applyPre(ctx: TContext, pre: HTMLPreElement): void {
	pre.style.maxHeight = ctx.state.contentStyle?.['max-height'] ?? ''
	ownerAttributes(pre, { ...ctx.state.contentAttrs, ...ctx.state.contentAria })
}

/** Text nodes keep source characters inert; line numbers are separate and hidden from AT. */
function drawCode(
	ctx: TContext,
	pre: HTMLPreElement,
	lines: readonly ICodeBlockLine[],
	dataset: TDatasetAttributes | undefined,
): void {
	const doc = pre.ownerDocument
	const code = doc.createElement('code')
	code.className = 'so-code-block__code'
	ownerAttributes(code, dataset)

	for (const line of lines) {
		const row = doc.createElement('span')
		row.className = 'so-code-block__line'
		ownerAttributes(row, line.dataset)

		if (ctx.state.lineNumbers) {
			const gutter = doc.createElement('span')
			gutter.className = 'so-code-block__gutter'
			gutter.setAttribute('aria-hidden', 'true')
			gutter.textContent = String(line.number)
			row.append(gutter)
		}
		const text = doc.createElement('span')
		text.className = 'so-code-block__text'
		text.textContent = line.text
		row.append(text)
		code.append(row)
	}
	pre.replaceChildren(code)
	applyPre(ctx, pre)
}

function drawPanel(ctx: TContext, panel: TTabsContentElementProps, record: ICodeBlockPanel): void {
	let pre = panelPres.get(panel)
	if (!pre) {
		pre = preOf(panel.ownerDocument)
		panelPres.set(panel, pre)
		lend(panel, 'default', pre)
	}
	drawCode(ctx, pre, record.lines, record.dataset)
}

export const codeBlockTemplate: ITemplate<ICodeBlock, unknown, TOutputs> = {
	create(root, ctx) {
		const doc = root.ownerDocument
		const header = doc.createElement('div')
		const title = doc.createElement('span')
		const icon = doc.createElement('span')
		const body = doc.createElement('div')
		const pre = preOf(doc)
		const status = doc.createElement('span')
		const tabs = createDetail(doc, TTabsElement, { embedded: 'code-block.tabs' })
		const copy = createDetail(doc, TButtonElement, {
			embedded: 'code-block.copy',
			attributes: { type: 'button' },
		})

		header.className = 'so-code-block__header'
		title.className = 'so-code-block__title'
		body.className = 'so-code-block__content'
		tabs.className = 'so-code-block__tabs'
		copy.className = 'so-code-block__copy'
		status.className = 'so-code-block__status'
		status.setAttribute('role', 'status')
		status.setAttribute('aria-live', 'polite')
		status.setAttribute('aria-atomic', 'true')
		header.append(icon, title)
		body.append(pre)

		const trailing = lendMark(tabs, 'trailing')
		const mark = lendMark(tabs, 'content')
		const panels = new TKeyedLoop<ICodeBlockPanel, string, TTabsContentElementProps>(
			tabs,
			mark,
			(panel) => panel.value,
		)
		copy.addEventListener('click', () => ctx.ctrl?.copy())
		parts.set(root, { header, title, tabs, body, pre, copy, status, trailing, panels })
		root.append(header, body, copy, status)
		return { slots: { 'title-icon': { mode: 'append', node: icon } } }
	},
	bindings: [
		bind(
			[
				'displayTitle',
				'tabbed',
				'copyable',
				'copyDisabled',
				'names_copy',
				'names_message',
				'size',
			],
			(ctx) => {
				const p = parts.get(ctx.root)
				if (!p) return

				p.title.textContent = ctx.state.displayTitle ?? ''
				// Removing the absent header avoids an empty flex row overriding native hidden styling.
				if (ctx.state.displayTitle) {
					if (p.header.parentNode !== ctx.root) ctx.root.prepend(p.header)
				} else p.header.remove()
				patch(p.copy, {
					size: ctx.state.size,
					text: ctx.state.names_copy,
					disabled: ctx.state.copyDisabled === true,
					rendered: ctx.state.copyable === true,
				})
				p.status.textContent = ctx.state.names_message ?? ''
				if (ctx.state.displayTitle) {
					if (p.copy.parentNode !== p.header) p.header.append(p.copy)
				} else if (ctx.state.tabbed) {
					if (p.copy.nextSibling !== p.trailing) lendBefore(p.trailing, p.copy)
				} else if (p.copy.parentNode !== p.body) p.body.append(p.copy)

				// Template creation precedes assembly; supply the live instances before inserting Tabs.
				if (ctx.ctrl) {
					p.tabs.ctrl = ctx.ctrl.tabs
					p.tabs.engine = ctx.ctrl.engine
				}
				const body = ctx.state.tabbed ? p.tabs : p.body
				const previous = ctx.state.tabbed ? p.body : p.tabs
				if (previous.parentNode === ctx.root) previous.remove()
				if (body.parentNode !== ctx.root) ctx.root.insertBefore(body, p.status)
			},
		),
		bind(['tabbed', 'panels', 'lines', 'codeDataset', 'lineNumbers'], (ctx) => {
			const p = parts.get(ctx.root)
			if (!p) return

			if (ctx.state.tabbed) {
				p.panels.draw(
					ctx.state.panels ?? [],
					(record) => {
						const panel = createDetail(ctx.root.ownerDocument, TTabsContentElement, {
							embedded: 'code-block.panel',
						})
						panel.className = 'so-code-block__content'
						panel.value = record.value
						drawPanel(ctx, panel, record)
						lend(p.tabs, 'content', panel)
						return panel
					},
					(panel, record) => drawPanel(ctx, panel, record),
				)
			} else drawCode(ctx, p.pre, ctx.state.lines ?? [], ctx.state.codeDataset)
		}),
		bind(['contentStyle', 'contentAria', 'contentAttrs'], (ctx) => {
			const p = parts.get(ctx.root)
			if (!p) return

			applyPre(ctx, p.pre)
			for (const record of ctx.state.panels ?? []) {
				const panel = p.panels.elementOf(record)
				const pre = panel && panelPres.get(panel)
				if (pre) applyPre(ctx, pre)
			}
		}),
	],
}
