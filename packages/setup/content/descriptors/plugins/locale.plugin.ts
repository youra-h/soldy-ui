/**
 * Определение TLocalePlugin (namespace `locale`) — язык монтирования
 * компоненту.
 *
 * Пропсов нет: язык знает место компонента в дереве — его задаёт провайдер
 * локали адаптера, — а не разметка. Плагин пишет тег локали поддерева в
 * `locale` владельца при установке и на каждую смену.
 *
 * Ставится только компонентам, которые читают язык: календарю, полю даты,
 * DatePicker, полю числа, таблице и пагинации.
 */

import { definePlugin } from '../../../protected/define'
import { TLocalePlugin } from '@soxa-ui/plugins'

export const LocalePluginDescriptor = definePlugin({
	ctor: TLocalePlugin,
	namespace: 'locale',
})
