/**
 * Определение TTextareaNamesPlugin (namespace `names`) — текст счётчика
 * символов Textarea от локали.
 *
 * Выход `names_counter` — «12 / 200» по шаблону локали `textarea.counter`,
 * без предела `maxlength` — одно число, цифры — по тегу локали. Шаблон
 * рисует его в счётчике при `counter`.
 */

import { definePlugin } from '../../../protected/define'
import { TTextareaNamesPlugin } from '@soldy-ui/plugins'

export const TextareaNamesPluginDescriptor = definePlugin({
	ctor: TTextareaNamesPlugin,
	namespace: 'names',
	contribution: {
		props: {
			counter: { protected: true, triggers: ['change:counter'] },
		},
	},
})
