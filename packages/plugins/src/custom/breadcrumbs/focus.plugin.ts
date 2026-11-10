import type { IBreadcrumbs, IMenu, TBreadcrumbsItem } from '@soxa-ui/core'
import { TBasePlugin, type IPluginContext } from '../../base'
import { TElementPlugin } from '../element'
import { isFocusableElement } from '../../utils'

/** Preserve a surviving location, or move to the nearest available stop after a trail update. */
export class TBreadcrumbsFocusPlugin extends TBasePlugin<IBreadcrumbs> {
	menu: IMenu | null = null
	private _element: TElementPlugin | null = null
	private _owner: IBreadcrumbs | null = null
	private _frame: number | null = null
	private _view: Window | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		this._element = ctx.get(TElementPlugin) ?? null
		this._owner = ctx.getInstance<IBreadcrumbs>() ?? null

		this._element?.events.on('removed', () => this._cancel())
		this._listenTo(this._owner?.events, 'change:items', ({ oldValue }) =>
			this._repair(oldValue),
		)
		this._listenTo(this._owner?.events, 'change:maxItems', () =>
			this._repair(this._owner?.items ?? []),
		)
	}

	override destroy(): void {
		this._cancel()

		this._frame = null
		this._element = null
		this._owner = null
		this.menu = null

		super.destroy()
	}

	private _cancel(): void {
		if (this._frame !== null) this._view?.cancelAnimationFrame(this._frame)
		this._frame = null
		this._view = null
	}

	private _repair(previous: readonly TBreadcrumbsItem[]): void {
		const root = this._element?.element
		const owner = this._owner
		const doc = root?.ownerDocument
		const active = doc?.activeElement
		const panelId = this.menu?.aria.get('id')
		const panel = typeof panelId === 'string' ? doc?.getElementById(panelId) : null

		if (
			!root ||
			!owner ||
			!doc ||
			!active ||
			(!root.contains(active) && !panel?.contains(active))
		)
			return

		const index = Number(
			active.closest('[data-breadcrumb-index]')?.getAttribute('data-breadcrumb-index') ?? -1,
		)
		const oldItem = previous[index]
		const view = doc.defaultView

		if (!view) return

		this._cancel()
		this._view = view
		this._frame = view.requestAnimationFrame(() => {
			this._frame = null
			this._view = null

			if (!root.isConnected) return
			// A deliberate focus move outside the component wins over this repair.

			const now = doc.activeElement

			if (
				now &&
				now !== doc.body &&
				now !== active &&
				!root.contains(now) &&
				!panel?.contains(now)
			)
				return

			const stops = [...root.querySelectorAll('a[href],.so-breadcrumbs__trigger')]
			const identity = oldItem ? owner.items.indexOf(oldItem) : -1
			const surviving =
				identity >= 0
					? identity
					: oldItem
						? (owner.items
								.map((item, index) => ({ item, index }))
								.filter(
									({ item }) =>
										item.text === oldItem.text && item.href === oldItem.href,
								)
								.sort(
									(a, b) => Math.abs(a.index - index) - Math.abs(b.index - index),
								)[0]?.index ?? -1)
						: -1
			const preserved =
				surviving >= 0
					? stops.find(
							(stop) =>
								stop.getAttribute('data-breadcrumb-index') === String(surviving),
						)
					: undefined
			const nearest = stops
				.filter((stop) => stop.hasAttribute('data-breadcrumb-index'))
				.sort(
					(a, b) =>
						Math.abs(Number(a.getAttribute('data-breadcrumb-index')) - index) -
						Math.abs(Number(b.getAttribute('data-breadcrumb-index')) - index),
				)[0]
			const trigger = root.querySelector('.so-breadcrumbs__trigger')
			const target =
				preserved ??
				(index === -1 ||
				(surviving >= 0 && owner.hiddenEntries.some((entry) => entry.index === surviving))
					? trigger
					: nearest) ??
				trigger ??
				root
			if (isFocusableElement(target)) target.focus()
		})
	}
}
