/**
 * Определение TListItemPlugin (namespace `listItem`) — подсветка элемента списка.
 *
 * Клавиатурная навигация: устанавливается на item-компоненте (ListBoxItem,
 * SelectItem), выход — `listItem_highlighted`.
 */

import { definePlugin } from '../../../protected/define'
import { TListItemPlugin } from '@soxa-ui/plugins'

export const ListItemPluginDescriptor = definePlugin({
	ctor: TListItemPlugin,
	namespace: 'listItem',
	contribution: {
		props: {
			highlighted: {
				protected: true,
				triggers: ['change:highlighted'],
			},
		},
	},
})
