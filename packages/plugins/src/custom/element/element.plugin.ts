import { TBasePlugin } from '../../base'
import type { TElementServiceEvents } from './types'

/**
 * Shares the adapter's root with DOM plugins. Public ready/removed events
 * retain their deferred, alternating lifecycle. The internal bind event
 * reports every root change synchronously so native controls can handle
 * activation before the first animation frame.
 *
 * A pending frame is the announcement state: replacing or removing the root
 * cancels it. Nodes remain Element because a component root may be SVG.
 */
export class TElementPlugin extends TBasePlugin<any, TElementServiceEvents> {
	private _element: Element | null = null
	/** Кадр с отложенным объявлением узла; `null` — объявлять нечего. */
	private _announceFrame: number | null = null

	get element(): Element | null {
		return this._element
	}

	set element(el: Element | null) {
		if (this._element === el) return

		const announced = this._element !== null && this._announceFrame === null

		this._cancelAnnounce()
		this._element = el

		if (announced) this.events.emit('removed')

		this.events.emit('bind', el)

		if (el) this._announce(el)
	}

	override destroy(): void {
		// Cancel the pending announcement before notifying internal bindings.
		this._cancelAnnounce()

		if (this._element) {
			this._element = null
			this.events.emit('bind', null)
		}

		super.destroy()
	}

	/** Объявляет узел через кадр. Смена узла до кадра объявление отменяет. */
	private _announce(el: Element): void {
		this._announceFrame = requestAnimationFrame(() => {
			this._announceFrame = null

			this.events.emit('ready', el)
		})
	}

	private _cancelAnnounce(): void {
		if (this._announceFrame === null) return

		cancelAnimationFrame(this._announceFrame)
		this._announceFrame = null
	}
}
