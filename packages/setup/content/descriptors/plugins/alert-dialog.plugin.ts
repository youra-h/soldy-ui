/**
 * AlertDialog behavior definitions share the modal infrastructure and expose localized labels.
 */

import { definePlugin } from '../../../protected/define'
import {
	TAlertDialogFocusPlugin,
	TAlertDialogIdsPlugin,
	TAlertDialogLayoutPlugin,
	TAlertDialogNamesPlugin,
} from '@soxa-ui/plugins'

export const AlertDialogFocusPluginDescriptor = definePlugin({
	ctor: TAlertDialogFocusPlugin,
	namespace: 'focus',
	contribution: {},
})
export const AlertDialogIdsPluginDescriptor = definePlugin({
	ctor: TAlertDialogIdsPlugin,
	namespace: 'ids',
})
export const AlertDialogLayoutPluginDescriptor = definePlugin({
	ctor: TAlertDialogLayoutPlugin,
	namespace: 'layout',
	contribution: {
		props: {
			styles: { protected: true, triggers: ['change:styles'] },
			backdropStyles: { protected: true, triggers: ['change:backdropStyles'] },
		},
	},
})
export const AlertDialogNamesPluginDescriptor = definePlugin({
	ctor: TAlertDialogNamesPlugin,
	namespace: 'names',
	contribution: {
		props: {
			confirm: { protected: true, triggers: ['change:confirm'] },
			cancel: { protected: true, triggers: ['change:cancel'] },
		},
	},
})
