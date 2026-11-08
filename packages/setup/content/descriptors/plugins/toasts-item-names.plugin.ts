/**
 * Определение TToastsItemNamesPlugin (namespace `names`) — имя кнопки закрытия
 * тоста от локали, вместе с текстом тоста.
 *
 * Пропсов нет: плагин пишет в набор тоста (`closeAria`), а его разметка уже
 * раскладывает.
 */

import { definePlugin } from '../../../protected/define'
import { TToastsItemNamesPlugin } from '@soxa-ui/plugins'

export const ToastsItemNamesPluginDescriptor = definePlugin({
	ctor: TToastsItemNamesPlugin,
	namespace: 'names',
})
