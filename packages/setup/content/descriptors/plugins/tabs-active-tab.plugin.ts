/**
 * Определение TTabsActiveTabPlugin (namespace `activeTab`) — геометрия активного таба.
 */

import { definePlugin } from '../../../protected/define'
import { TTabsActiveTabPlugin } from '@soxa-ui/plugins'

export const TabsActiveTabPluginDescriptor = definePlugin({
	ctor: TTabsActiveTabPlugin,
	namespace: 'activeTab',
})
