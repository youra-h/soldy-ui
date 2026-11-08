import { isCloseRequestable, isEventSource } from '@soxa-ui/core'
import type { IPluginContext } from '../../base'
import type { IOverlayOpenOptions, IOverlayOpenState } from './types'

/** Свойство открытости по умолчанию — см. `IOverlayOpenOptions.property`. */
const DEFAULT_PROPERTY = 'open'

/**
 * Binds overlay behavior to its owner's openness and visibility. A hidden
 * owner keeps its open state, but dismiss, focus and scroll behavior pause
 * until it is shown again. Owners without a visible property remain supported.
 *
 * User dismissal goes through requestClose when available; programmatic writes
 * still target the configured property. Each binding removes only its own
 * subscriptions when the plugin is destroyed.
 */
export function bindOverlayOpen(
	ctx: IPluginContext,
	options: IOverlayOpenOptions | undefined,
	onChange: (open: boolean) => void,
): IOverlayOpenState | null {
	const instance = ctx.getInstance<object>()
	const property = options?.property === undefined ? DEFAULT_PROPERTY : options.property

	if (!instance || !property || !(property in instance)) return null

	const read = (): boolean =>
		!!Reflect.get(instance, property) && Reflect.get(instance, 'visible') !== false
	const write = (value: boolean): void => {
		Reflect.set(instance, property, value)
	}
	const events: unknown = Reflect.get(instance, 'events')
	const source = isEventSource(events) ? events : null
	const event = options?.event ?? `change:${property}`
	const handler = (): void => onChange(read())

	source?.on(event, handler)
	if (property !== 'visible') source?.on('change:visible', handler)

	return {
		read,
		write,
		close(reason) {
			if (isCloseRequestable(instance)) {
				instance.requestClose(reason)
			} else {
				write(false)
			}
		},
		unbind(): void {
			source?.off(event, handler)
			if (property !== 'visible') source?.off('change:visible', handler)
		},
	}
}
