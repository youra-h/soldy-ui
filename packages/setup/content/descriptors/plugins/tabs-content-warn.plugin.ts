/**
 * Определение TTabsContentWarnPlugin (namespace `contentWarn`) — диагностика слота панели.
 *
 * Предупреждает, если панель Tabs.Content оказалась внутри [role="tablist"]
 * (положена в default вместо content).
 */

import { definePlugin } from '../../../protected/define'
import { TTabsContentWarnPlugin } from '@soxa-ui/plugins'

export const TabsContentWarnPluginDescriptor = definePlugin({
	ctor: TTabsContentWarnPlugin,
	namespace: 'contentWarn',
})
