import type { IToggleGroup, IToggleGroupItem, TToggleGroupCollection } from '@soxa-ui/core'
import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'
import { TElementPlugin } from '../element'
import { TCollectionElements } from '../collection'
import { isFocusableElement } from '../../utils'
import type { IDomEventTarget } from '../../utils'

/** Group buttons keep selection on activation; arrows only move DOM focus. */
export class TToggleGroupPlugin extends TBasePlugin<IToggleGroup> {
	private _root: Element | null = null
	private _owner: IToggleGroup | null = null
	private _elements: TCollectionElements | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)
		this._owner = ctx.getInstance<IToggleGroup>()
		this._elements = ctx.get(TCollectionElements) ?? null

		const element = ctx.get(TElementPlugin)
		element?.events.on('ready', (root) => this._attach(root))
		element?.events.on('removed', () => this._detach())
	}

	private get _engine(): TToggleGroupCollection | null {
		return this._elements?.engine ?? null
	}

	private _attach(root: Element): void {
		this._detach()
		this._root = root

		const target: IDomEventTarget = root
		target.addEventListener('keydown', this._keyDown)
		target.addEventListener('click', this._click)
	}

	private _detach(): void {
		const target: IDomEventTarget | null = this._root
		target?.removeEventListener('keydown', this._keyDown)
		target?.removeEventListener('click', this._click)
		this._root = null
	}

	/** Nested groups and unrelated slot controls must keep their own input. */
	private _itemOf(target: EventTarget | null): IToggleGroupItem | undefined {
		if (!(target instanceof Element) || target.closest('.so-toggle-group') !== this._root)
			return undefined

		return this._engine?.extensions.batch.shown.find((item) => {
			const node = this._elements?.getElementByUid(item.uid)
			return node === target || node?.contains(target)
		})
	}

	private readonly _click = (event: MouseEvent): void => {
		const item = this._itemOf(event.target)
		const engine = this._engine

		if (!item || !engine) return

		// Complete propagation before checking cancellation, including delegated handlers.
		queueMicrotask(() => {
			if (
				this._root &&
				!event.defaultPrevented &&
				engine.extensions.toggleGroup.isEnabled(item)
			) {
				engine.extensions.selection.toggle(item)
			}
		})
	}

	private readonly _keyDown = (event: KeyboardEvent): void => {
		if (
			event.defaultPrevented ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return

		const engine = this._engine
		const item = this._itemOf(event.target)

		if (!engine || !item || event.target !== this._elements?.getElementByUid(item.uid)) return

		const next = this._next(engine, event.key, item)
		const node = next ? this._elements?.getElementByUid(next.uid) : null

		if (!isFocusableElement(node)) return

		event.preventDefault()
		node.focus()
	}

	/** Resolves navigation in display order, including a currently unavailable source item. */
	private _next(
		engine: TToggleGroupCollection,
		key: string,
		item: IToggleGroupItem,
	): IToggleGroupItem | undefined {
		const shown = engine.extensions.batch.shown
		const available = shown.filter((candidate) =>
			engine.extensions.toggleGroup.isEnabled(candidate),
		)

		if (key === 'Home') return available[0]
		if (key === 'End') return available.at(-1)

		const orientation = this._owner?.orientation ?? 'horizontal'
		const [back, forward] =
			orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
		let step = key === back ? -1 : key === forward ? 1 : 0

		if (!step) return undefined

		if (
			orientation === 'horizontal' &&
			this._root &&
			getComputedStyle(this._root).direction === 'rtl'
		)
			step = -step

		const index = shown.indexOf(item)

		for (let offset = 1; offset <= shown.length; offset++) {
			const candidate =
				shown[(((index + step * offset) % shown.length) + shown.length) % shown.length]

			if (engine.extensions.toggleGroup.isEnabled(candidate)) return candidate
		}

		return undefined
	}

	override destroy(): void {
		this._detach()
		this._owner = null
		this._elements = null
		super.destroy()
	}
}

/** Programmatic group focus follows the same stop as keyboard Tab. */
export function toggleStopOf(_root: Element, ctx: IPluginContext): Element | null {
	const elements = ctx.get(TCollectionElements)
	const engine: TToggleGroupCollection | null = elements?.engine ?? null
	const stop = engine?.extensions.toggleGroup.tabStop

	return stop ? (elements?.getElementByUid(stop.uid) ?? null) : null
}
