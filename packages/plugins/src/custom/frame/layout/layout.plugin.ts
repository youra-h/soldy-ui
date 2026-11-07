import type { IFrame } from '@soldy-ui/core'
import { TBasePlugin } from '../../../base'
import type { IPluginContext } from '../../../base'
import { toCssValue } from '../../../utils'
import type { TFrameLayoutPluginEvents } from './types'

/**
 * Converts Frame properties into the styles applied by the template.
 * Subscribes to change:x/y/width/height/zIndex/strategy and contained.
 * A contained panel uses absolute positioning without inline coordinates:
 * the theme places it using data-contained, without left/top overriding it.
 * Anchoring belongs to TAnchorPlugin, which writes x/y/width; this plugin
 * only renders the values already stored in Frame.
 *
 * @example
 * const layout = bundle.get(TFrameLayoutPlugin)
 * // layout?.styles: { position: 'fixed', left: '100px', top: '200px', 'z-index': 1001 }
 */
export class TFrameLayoutPlugin extends TBasePlugin<any, TFrameLayoutPluginEvents> {
	private _styles: Record<string, string | number> = {}
	private _frame: IFrame | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		const frame = ctx.getInstance<IFrame>()

		if (frame) {
			this._frame = frame
			this._bindFrame(frame)
		}
	}

	get styles(): Record<string, string | number> {
		return this._styles
	}

	override destroy(): void {
		this._frame = null

		super.destroy()
	}

	private _bindFrame(frame: IFrame): void {
		const update = () => this._update()

		this._listenTo(frame.events, 'change:x', update)
		this._listenTo(frame.events, 'change:y', update)
		this._listenTo(frame.events, 'change:width', update)
		this._listenTo(frame.events, 'change:height', update)
		this._listenTo(frame.events, 'change:zIndex', update)
		this._listenTo(frame.events, 'change:strategy', update)
		this._listenTo(frame.events, 'change:contained', update)

		this._update()
	}

	private _update(): void {
		const oldStyles = this.styles

		if (!this._frame) return

		const frame = this._frame

		const styles: Record<string, string | number> = frame.contained
			? { position: 'absolute' }
			: { position: frame.strategy, left: toCssValue(frame.x), top: toCssValue(frame.y) }

		if (frame.width !== undefined) styles['width'] = toCssValue(frame.width)
		if (frame.height !== undefined) styles['height'] = toCssValue(frame.height)

		styles['z-index'] = frame.zIndex

		this._styles = styles
		this.events.emit('change:styles', { newValue: this._styles, oldValue: oldStyles })
	}
}
