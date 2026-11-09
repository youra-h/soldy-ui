import type { IToastsItem, TToastsCollection } from '@soxa-ui/core'
import { TBasePlugin } from '../../../base'
import type { IPluginContext } from '../../../base'
import { TElementPlugin } from '../../element'
import { TCollectionBundlesPlugin } from '../../collection'

/**
 * Persistent, text-only live regions announce messages independently of the
 * interactive toast list. Icons, list positions and close-button names are
 * available during navigation, but are never part of an automatic message.
 * The empty regions mount a frame before their first content; changes made
 * together (loading, type, text, description) are announced together.
 */
export class TToastsAnnouncePlugin extends TBasePlugin {
	private _engine: TToastsCollection | null = null
	private _regions: HTMLElement[] = []
	private _frame: number | null = null
	private readonly _pending = new Set<IToastsItem>()
	private readonly _watched = new Map<IToastsItem, () => void>()

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		ctx.get(TElementPlugin)?.events.on('ready', (node) => this._attach(node))
		ctx.get(TElementPlugin)?.events.on('removed', () => this._detach())

		ctx.get(TCollectionBundlesPlugin)?.events.on('engine:bound', (engine) => {
			for (const dispose of this._watched.values()) dispose()

			this._watched.clear()
			this._pending.clear()
			this._engine = engine

			this._listenTo(engine.extensions.batch.events, 'change:shown', () => this._sync())
			this._listenTo(engine.extensions.toasts.events, 'item:close', () => this._sync())

			this._sync()
		})
	}

	private _attach(node: Element): void {
		this._detach()

		this._regions = ['polite', 'assertive'].map((priority) => {
			const region = node.ownerDocument.createElement('div')

			region.setAttribute('data-so-toasts-announcer', priority)
			region.setAttribute('aria-live', priority)
			region.setAttribute('aria-atomic', 'true')
			region.setAttribute('aria-relevant', 'additions text')

			// This is functional accessibility markup, independent of any theme.
			Object.assign(region.style, {
				position: 'absolute',
				width: '1px',
				height: '1px',
				padding: '0',
				margin: '-1px',
				overflow: 'hidden',
				clipPath: 'inset(50%)',
				whiteSpace: 'nowrap',
				border: '0',
			})

			node.append(region)

			return region
		})

		this._schedule()
	}

	private _sync(): void {
		const shown = new Set(this._engine?.extensions.batch.shown.filter((item) => item.open))

		for (const [item, dispose] of this._watched) {
			if (shown.has(item)) continue

			dispose()
			this._watched.delete(item)
			this._pending.delete(item)
		}

		for (const item of shown) {
			if (this._watched.has(item)) continue

			const update = (): void => {
				this._pending.add(item)
				this._schedule()
			}

			item.events.on('change:text', update)
			item.events.on('change:description', update)
			this._watched.set(item, () => {
				item.events.off('change:text', update)
				item.events.off('change:description', update)
			})

			update()
		}
	}

	private _schedule(): void {
		if (!this._regions.length || this._frame !== null) return

		this._frame = requestAnimationFrame(() => {
			this._frame = null

			const messages = [[], []] as [string[], string[]]

			for (const item of this._pending) {
				if (!item.open || !this._watched.has(item)) continue

				const text = [item.text, item.description].filter(Boolean).join('. ')
				if (text) messages[item.alert ? 1 : 0].push(text)
			}

			this._pending.clear()

			messages.forEach((texts, index) => {
				if (!texts.length) return

				const region = this._regions[index]

				// A fresh text node also announces a new toast with identical text.
				region.replaceChildren(region.ownerDocument.createTextNode(texts.join('\n')))
			})
		})
	}

	private _detach(): void {
		if (this._frame !== null) cancelAnimationFrame(this._frame)

		this._frame = null

		for (const region of this._regions) region.remove()

		this._regions = []
	}

	override destroy(): void {
		this._detach()

		for (const dispose of this._watched.values()) dispose()

		this._watched.clear()
		this._pending.clear()
		this._engine = null

		super.destroy()
	}
}
