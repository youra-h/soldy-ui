/**
 * Определение TIconLayoutPlugin (namespace `layout`) — размер иконки.
 *
 * Выход `layout_styles` — стили из `size`, `width` и `height`, их вешает шаблон.
 */

import { definePlugin } from '../../../protected/define'
import { TIconLayoutPlugin } from '@soxa-ui/plugins'

export const IconLayoutPluginDescriptor = definePlugin({
	ctor: TIconLayoutPlugin,
	namespace: 'layout',
	contribution: {
		props: {
			styles: {
				type: Object,
				protected: true,
				triggers: ['change:styles'],
			},
		},
	},
})
