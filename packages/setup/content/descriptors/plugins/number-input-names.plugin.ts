/**
 * Определение TNumberInputNamesPlugin (namespace `names`) — имена кнопок поля
 * числа от локали, вместе с именем поля.
 *
 * Пропсов нет: плагин пишет в наборы поля — кнопок шага (`decrementAria`,
 * `incrementAria`) и кнопки очистки (`clearAria`, как у любого поля), — а
 * разметка их раскладывает.
 */

import { definePlugin } from '../../../protected/define'
import { TNumberInputNamesPlugin } from '@soldy-ui/plugins'

export const NumberInputNamesPluginDescriptor = definePlugin({
	ctor: TNumberInputNamesPlugin,
	namespace: 'names',
})
