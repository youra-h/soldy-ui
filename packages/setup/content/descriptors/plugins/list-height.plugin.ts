/**
 * Определение TListHeightPlugin (namespace `height`) — высота списка по `maxRows`.
 *
 * Применяет `maxRows` компонента (ListBox, Select) — предел высоты контейнера
 * элементов и прокрутка сверх него.
 */

import { definePlugin } from '../../../protected/define'
import { TListHeightPlugin } from '@soldy-ui/plugins'

export const ListHeightPluginDescriptor = definePlugin({
	ctor: TListHeightPlugin,
	namespace: 'height',
})
