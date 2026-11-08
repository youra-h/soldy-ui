import type { INamingStrategy } from '@soxa-ui/setup'
import { underscorePropNaming, callbackEventNaming } from '@soxa-ui/setup'

/** Имена Solid: `iconStyles_styles`, события — колбэк-пропсы `onElementReady`. */
export const SolidNaming: INamingStrategy = {
	prop: underscorePropNaming,
	event: callbackEventNaming,
}
