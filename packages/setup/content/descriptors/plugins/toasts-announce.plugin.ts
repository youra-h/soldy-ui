/**
 * Defines the shared text-only announcement behavior for Toasts.
 */

import { definePlugin } from '../../../protected/define'
import { TToastsAnnouncePlugin } from '@soxa-ui/plugins'

/** Text-only messages, separate from the interactive notification stack. */
export const ToastsAnnouncePluginDescriptor = definePlugin({
	ctor: TToastsAnnouncePlugin,
	namespace: 'announce',
})
