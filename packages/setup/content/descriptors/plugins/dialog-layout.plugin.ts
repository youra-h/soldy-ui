/**
 * Определение TDialogLayoutPlugin (namespace `layout`) — раскладка модального
 * окна.
 *
 * Два выхода: `layout_styles` — `z-index` слоя, переменные размера и отступа
 * панели, `layout_backdropStyles` — тот же `z-index` подложки. Вешает их
 * шаблон, место и разворот раскладывает тема.
 *
 * Событие `offset:before` (`layout:offset:before` у окна) выведено наружу:
 * стороны отступа по отдельности правит потребитель, плагин только
 * спрашивает.
 */

import { definePlugin } from '../../../protected/define'
import { TDialogLayoutPlugin } from '@soldy-ui/plugins'

export const DialogLayoutPluginDescriptor = definePlugin({
	ctor: TDialogLayoutPlugin,
	namespace: 'layout',
	contribution: {
		events: ['offset:before'],
		props: {
			styles: {
				protected: true,
				triggers: ['change:styles'],
			},
			backdropStyles: {
				protected: true,
				triggers: ['change:backdropStyles'],
			},
		},
	},
})
