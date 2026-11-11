import { TBasePlugin } from '../../base'
import type { IPluginContext } from '../../base'
import { TElementPlugin } from '../element'
import { tabStops } from '../../utils'
import type { IScrollFocusOptions, IScrollFocusOwner } from './types'

/**
 * Make a scroll container a Tab stop only when it has something to scroll and
 * no available stop inside. Native keyboard scrolling remains the browser's job.
 */
export class TScrollFocusPlugin extends TBasePlugin<IScrollFocusOwner> {
	private _owner: IScrollFocusOwner | null = null
	private _viewport: Element | null = null
	private _resize: ResizeObserver | null = null
	private _mutation: MutationObserver | null = null
	private _frame: number | null = null
	private readonly _observed = new Set<Element>()

	override install(ctx: IPluginContext, options: IScrollFocusOptions): void {
		super.install(ctx, options)

		this._owner = ctx.getInstance<IScrollFocusOwner>()

		const element = ctx.get(TElementPlugin)

		element?.events.on('ready', (root) => {
			this._detach()
			this._viewport = this._owner ? options.target(this._owner, root) : null

			if (!this._viewport) return

			this._resize = new ResizeObserver(this._schedule)
			this._mutation = new MutationObserver(this._schedule)
			// Availability can change without geometry: disabled, roving tabindex,
			// hidden controls and slot replacement must all invalidate the measure.
			this._mutation.observe(this._viewport, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
				attributeFilter: [
					'disabled',
					'tabindex',
					'hidden',
					'inert',
					'class',
					'style',
					'href',
					'type',
					'contenteditable',
					'controls',
					'open',
					'name',
					'checked',
				],
			})
			this._schedule()
		})
		element?.events.on('removed', () => this._detach())
	}

	override destroy(): void {
		this._detach()
		this._owner = null

		super.destroy()
	}

	private _detach(): void {
		this._resize?.disconnect()
		this._mutation?.disconnect()
		this._resize = null
		this._mutation = null
		this._observed.clear()

		if (this._frame !== null) cancelAnimationFrame(this._frame)

		this._frame = null
		this._viewport = null
		// A consumer-owned model can survive its mounted DOM and its plugin.
		this._owner?.scrollAttrs.remove('tabindex')
	}

	private readonly _schedule = (): void => {
		if (this._frame !== null || !this._viewport) return

		// Never update an adapter from ResizeObserver's delivery phase.
		this._frame = requestAnimationFrame(() => {
			this._frame = null
			this._observe()
			this._measure()
		})
	}

	private _observe(): void {
		const viewport = this._viewport
		const observer = this._resize

		if (!viewport || !observer) return

		// Observe content and viewport without one target per table cell.
		// Reobserving unchanged nodes would schedule measurements forever.
		const current = new Set([viewport, ...viewport.children])

		for (const node of this._observed) {
			if (current.has(node)) continue

			observer.unobserve(node)
			this._observed.delete(node)
		}

		for (const node of current) {
			if (this._observed.has(node)) continue

			observer.observe(node, { box: 'border-box' })
			this._observed.add(node)
		}
	}

	private _measure(): void {
		const viewport = this._viewport

		if (!viewport || !this._owner) return

		const style = getComputedStyle(viewport)
		const scrollable = (overflow: string): boolean => /^(auto|scroll|overlay)$/.test(overflow)
		const overflow =
			viewport.clientWidth > 0 &&
			viewport.clientHeight > 0 &&
			((scrollable(style.overflowX) && viewport.scrollWidth > viewport.clientWidth) ||
				(scrollable(style.overflowY) && viewport.scrollHeight > viewport.clientHeight))
		// tabStops ignores layout for its jsdom callers. A hidden slot control
		// must not make real overflowing content unreachable in the browser.
		const hasStop =
			overflow &&
			tabStops(viewport).some(
				(node) =>
					node.getClientRects().length > 0 &&
					getComputedStyle(node).visibility === 'visible',
			)

		this._owner.scrollAttrs.add('tabindex', overflow && !hasStop ? '0' : null)
	}
}
