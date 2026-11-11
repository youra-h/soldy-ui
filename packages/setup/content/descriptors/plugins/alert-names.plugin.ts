/**
 * Locale-driven dismissal name for the Alert close control.
 */

import { definePlugin } from '../../../protected/define'
import { TAlertNamesPlugin } from '@soxa-ui/plugins'

export const AlertNamesPluginDescriptor = definePlugin({
	ctor: TAlertNamesPlugin,
	namespace: 'names',
})
