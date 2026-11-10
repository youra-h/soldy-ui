import { batchOf, plainOf } from '@soxa-ui/core'
import type {
	IBreadcrumbs,
	IBreadcrumbsItem,
	TActionEvent,
	TBreadcrumbsCollection,
} from '@soxa-ui/core'
import { TBasePlugin, type IPluginContext } from '../../base'
import { TElementPlugin } from '../element'
import { TCollectionBundlesPlugin, TCollectionElements } from '../collection'
import { isFocusableElement } from '../../utils'

type TFocusPlace = {
	readonly active: Element
	readonly item: IBreadcrumbsItem | undefined
	readonly index: number
}

/** Repair a changed trail by collection identity, after its markup has settled. */
export class TBreadcrumbsFocusPlugin extends TBasePlugin<IBreadcrumbs> {
	private _element: TElementPlugin | null = null
	private _elements: TCollectionElements | null = null
	private _engine: TBreadcrumbsCollection | null = null
	private _place: TFocusPlace | null = null
	private _before: TActionEvent | undefined
	private _frame: number | null = null
	private _view: Window | null = null
	private _stopWaiting: (() => void) | undefined
	private _unbind: (() => void) | undefined

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		this._element = ctx.get(TElementPlugin) ?? null
		this._elements = ctx.get(TCollectionElements) ?? null
		this._listenTo(this._element?.events, 'removed', () => this._cancel())
		this._listenTo(ctx.getInstance<IBreadcrumbs>()?.events, 'change:maxItems', this._schedule)

		const bundles = ctx.get(TCollectionBundlesPlugin)

		this._listenTo(bundles?.events, 'engine:bound', (engine) => this._bindEngine(engine))
		if (bundles?.engine) this._bindEngine(bundles.engine)
	}

	override destroy(): void {
		this._bindEngine(null)
		this._element = null
		this._elements = null

		super.destroy()
	}

	private _bindEngine(engine: TBreadcrumbsCollection | null): void {
		this._cancel()
		this._unbind?.()
		this._engine = engine

		const events = plainOf<IBreadcrumbsItem>(engine)?.events
		const windowEvents = engine?.extensions.breadcrumbs.events
		const menu = engine?.extensions.breadcrumbs.menu
		const captureMenu = () => {
			if (menu?.open) return
			this._capture()
			// A collection update closes the menu before changing its proxy list.
			// An ordinary close has no trail repair and releases this capture.
			queueMicrotask(() => {
				if (this._frame === null) this._place = null
			})
		}
		menu?.events.on('change:open', captureMenu)

		// The registry still contains the departing item's bundle in before hooks.
		events?.on('item:add:before', this._capture)
		events?.on('item:remove:before', this._capture)
		events?.on('items:clear:before', this._capture)
		events?.on('item:move:before', this._capture)
		events?.on('item:update:before', this._capture)
		events?.on('change:items', this._schedule)
		windowEvents?.on('change:window', this._schedule)
		this._unbind = () => {
			menu?.events.off('change:open', captureMenu)
			events?.off('item:add:before', this._capture)
			events?.off('item:remove:before', this._capture)
			events?.off('items:clear:before', this._capture)
			events?.off('item:move:before', this._capture)
			events?.off('item:update:before', this._capture)
			events?.off('change:items', this._schedule)
			windowEvents?.off('change:window', this._schedule)
		}
	}

	private _cancel(): void {
		if (this._frame !== null) this._view?.cancelAnimationFrame(this._frame)
		this._stopWaiting?.()
		this._stopWaiting = undefined
		this._frame = null
		this._view = null
		this._place = null
		this._before = undefined
	}

	private readonly _capture = (event?: TActionEvent): void => {
		if (this._frame !== null) return
		if (this._before?.defaultPrevented) this._place = null
		if (this._place) return
		this._stopWaiting?.()
		this._stopWaiting = undefined
		this._before = event

		const root = this._element?.element
		const active = root?.ownerDocument.activeElement
		const menu = this._engine?.extensions.breadcrumbs.menu
		const panelId = menu?.aria.get('id')
		const panel =
			typeof panelId === 'string' ? root?.ownerDocument.getElementById(panelId) : null

		this._place = null
		if (!root || !active || (!root.contains(active) && !panel?.contains(active))) return

		const items = batchOf<IBreadcrumbsItem>(this._engine)?.items ?? []
		// A trigger inside the first li belongs to the overflow stop, not its crumb.
		const item = items.find((candidate) =>
			this._elements
				?.getElementByItem(candidate)
				?.querySelector('.so-breadcrumbs__link')
				?.contains(active),
		)

		// MenuItem's action plugin already tracks the real focus of its row.
		const overflowItem = this._engine?.extensions.breadcrumbs.overflowEntries.find(
			({ menuItem }) => menuItem.focused,
		)?.item
		const focused = item ?? overflowItem

		this._place = { active, item: focused, index: focused ? items.indexOf(focused) : -1 }
	}

	private readonly _schedule = (): void => {
		if (this._frame !== null) return
		if (this._before?.defaultPrevented) {
			this._place = null
			this._before = undefined
		}
		if (!this._place) this._capture()
		if (!this._place) return

		const view = this._element?.element?.ownerDocument.defaultView

		if (!view) return

		this._view = view
		this._frame = view.requestAnimationFrame(() => {
			this._frame = null
			this._view = null
			const place = this._place

			this._place = null
			this._before = undefined
			if (!place || this._pass(place)) return
			this._stopWaiting = this._elements?.waitFor(() => this._pass(place))
		})
	}

	/** False means the surviving target has not announced its element yet. */
	private _pass(place: TFocusPlace): boolean {
		const root = this._element?.element
		const engine = this._engine

		if (!root?.isConnected || !engine) return true

		const { activeElement, body } = root.ownerDocument

		// Any deliberate focus move wins, including a move to another trail link.
		if (activeElement && activeElement !== body && activeElement !== place.active) return true

		const items = batchOf<IBreadcrumbsItem>(engine)?.items ?? []
		const extension = engine.extensions.breadcrumbs
		const current = place.item && items.includes(place.item) ? place.item : undefined
		const collapsed = current && extension.isCollapsed(current)
		const available = (item: IBreadcrumbsItem) =>
			item.href !== undefined &&
			!item.disabled &&
			item.rendered &&
			item.visible &&
			!extension.isCollapsed(item)
		const targetItem =
			current && available(current)
				? current
				: !collapsed && place.index >= 0
					? items
							.map((item, index) => ({ item, index }))
							.filter(({ item }) => available(item))
							.sort(
								(a, b) =>
									Math.abs(a.index - place.index) -
									Math.abs(b.index - place.index),
							)[0]?.item
					: undefined
		const target = targetItem
			? this._elements?.getElementByItem(targetItem)?.querySelector('.so-breadcrumbs__link')
			: extension.overflowEntries.length
				? root.querySelector('.so-breadcrumbs__trigger')
				: root

		if (!target) return false
		if (isFocusableElement(target)) target.focus()
		return true
	}
}
