/**
 * Определение TDateInputClipboardPlugin (namespace `clipboard`) — буфер обмена
 * и перетаскивание поля даты.
 *
 * Копирует и вырезает выделенное в ряду текстом узлов, вставку отдаёт ядру —
 * дата ISO или в формате поля заменяет всю дату. Своих пропсов и выходов нет.
 */

import { definePlugin } from '../../../protected/define'
import { TDateInputClipboardPlugin } from '@soxa-ui/plugins'

export const DateInputClipboardPluginDescriptor = definePlugin({
	ctor: TDateInputClipboardPlugin,
	namespace: 'clipboard',
})
