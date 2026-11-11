import type { IAvatar } from '@soxa-ui/core'
import { TBasePlugin, type IPluginContext } from '../../base'
import { TElementPlugin } from '../element'

/** Preload in the mounted root's document; stale requests cannot publish state. */
export class TAvatarImagePlugin extends TBasePlugin<IAvatar> {
	private _instance: IAvatar | null = null
	private _element: Element | null = null
	private _image: HTMLImageElement | null = null
	private _generation = 0
	private _cancel: (() => void) | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		this._instance = ctx.getInstance<IAvatar>()
		if (this._instance) this._instance.status = 'idle'

		const element = ctx.get(TElementPlugin)

		element?.events.on('ready', (root) => {
			this._element = root
			this._load()
		})
		element?.events.on('removed', () => this._detach())
		this._listenTo(this._instance?.events, 'change:src', () => this._load())
	}

	private _load(): void {
		this._clear()

		const generation = this._generation
		const instance = this._instance
		const root = this._element
		if (!instance) return

		instance.status = 'idle'

		if (generation !== this._generation || !root || !instance.src) return

		const image = root.ownerDocument.createElement('img')

		this._image = image

		const finish = (): void => {
			if (this._image !== image) return

			const status = image.naturalWidth > 0 ? 'loaded' : 'error'

			// A status listener may synchronously start the next request.
			this._clear()
			instance.status = status
		}

		image.addEventListener('load', finish)
		image.addEventListener('error', finish)
		this._cancel = () => {
			image.removeEventListener('load', finish)
			image.removeEventListener('error', finish)
		}
		instance.status = 'loading'

		if (this._image !== image) return

		image.src = instance.src

		// Cached resources may already be complete without another event.
		if (image.complete) finish()
	}

	private _clear(): void {
		this._generation++
		this._image = null
		this._cancel?.()
		this._cancel = null
	}

	private _detach(): void {
		this._clear()
		this._element = null
		if (this._instance) this._instance.status = 'idle'
	}

	override destroy(): void {
		this._detach()
		this._instance = null

		super.destroy()
	}
}
