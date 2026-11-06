/**
 * Определение TFrameLayoutPlugin (namespace `layout`) — раскладка Frame.
 *
 * Выход `layout_styles` — стили из собственных пропсов Frame, их вешает шаблон.
 */

import { definePlugin } from '../../../protected/define'
import { TFrameLayoutPlugin } from '@soldy-ui/plugins'

export const FrameLayoutPluginDescriptor = definePlugin({
	ctor: TFrameLayoutPlugin,
	namespace: 'layout',
	contribution: {
		props: {
			styles: {
				protected: true,
				triggers: ['change:styles'],
			},
		},
	},
})
