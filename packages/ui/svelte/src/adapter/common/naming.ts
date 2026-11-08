/** Имена поверхности: события — колбэк-пропы, как у React (`element:ready` → `onElementReady`). */

import type { INamingStrategy } from '@soxa-ui/setup'
import { underscorePropNaming, callbackEventNaming } from '@soxa-ui/setup'

export const SvelteNaming: INamingStrategy = {
	prop: underscorePropNaming,
	event: callbackEventNaming,
}
