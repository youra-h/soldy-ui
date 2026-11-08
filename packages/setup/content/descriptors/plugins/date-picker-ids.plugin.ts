/**
 * Определение TDatePickerIdsPlugin (namespace `ids`) — связка «кнопка
 * календаря ↔ панель» DatePicker в документе: `id` панели и `aria-controls`
 * кнопки.
 *
 * Пропсов нет: плагин пишет в наборы DatePicker (`panelAria`, `triggerAria`),
 * а их разметка уже раскладывает.
 */

import { definePlugin } from '../../../protected/define'
import { TDatePickerIdsPlugin } from '@soxa-ui/plugins'

export const DatePickerIdsPluginDescriptor = definePlugin({
	ctor: TDatePickerIdsPlugin,
	namespace: 'ids',
})
