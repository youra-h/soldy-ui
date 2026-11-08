/**
 * Определение TRadioGroupCheckedPlugin (namespace `checked`) — отметка полей
 * группы по модели после выбора пользователя.
 *
 * Пропсов нет: плагин пишет `checked` в поля радио, когда коллекция отказала в
 * выборе, а браузер нажатое радио уже отметил.
 */

import { definePlugin } from '../../../protected/define'
import { TRadioGroupCheckedPlugin } from '@soxa-ui/plugins'

export const RadioGroupCheckedPluginDescriptor = definePlugin({
	ctor: TRadioGroupCheckedPlugin,
	namespace: 'checked',
})
