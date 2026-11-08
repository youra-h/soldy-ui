/**
 * Именование React: проп плагина `iconStyles_styles`, событие
 * `element:ready` → колбэк `onElementReady`.
 */

import type { INamingStrategy } from '@soxa-ui/setup'
import { underscorePropNaming, callbackEventNaming } from '@soxa-ui/setup'

export const ReactNaming: INamingStrategy = {
	prop: underscorePropNaming,
	event: callbackEventNaming,
}
