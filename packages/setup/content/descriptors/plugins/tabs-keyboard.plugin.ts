/**
 * Определение TTabsKeyboardPlugin (namespace `keyboard`) — клавиатура Tabs по APG Tabs.
 *
 * Стрелки и `Home`/`End` переносят фокус и активацию, `Delete` закрывает таб.
 * Подключается после плагинов коллекции — берёт у них движок и узлы табов.
 */

import { definePlugin } from '../../../protected/define'
import { TTabsKeyboardPlugin } from '@soldy-ui/plugins'

export const TabsKeyboardPluginDescriptor = definePlugin({
	ctor: TTabsKeyboardPlugin,
	namespace: 'keyboard',
})
