/**
 * Определение TPopoverIdsPlugin (namespace `ids`) — связка «триггер ↔ панель»
 * поповера в документе: `id` панели и `aria-controls` триггера.
 *
 * Пропсов нет: плагин пишет в наборы поповера (`aria`, `triggerAria`), а их
 * разметка уже раскладывает.
 */

import { definePlugin } from '../../../protected/define'
import { TPopoverIdsPlugin } from '@soxa-ui/plugins'

export const PopoverIdsPluginDescriptor = definePlugin({
	ctor: TPopoverIdsPlugin,
	namespace: 'ids',
})
