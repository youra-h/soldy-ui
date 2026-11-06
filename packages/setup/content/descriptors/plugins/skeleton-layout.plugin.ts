/**
 * Определение TSkeletonLayoutPlugin (namespace `layout`) — размер заглушки Skeleton.
 *
 * Выход `layout_styles` — ширина и высота заглушки, их вешает шаблон.
 */

import { definePlugin } from '../../../protected/define'
import { TSkeletonLayoutPlugin } from '@soldy-ui/plugins'

export const SkeletonLayoutPluginDescriptor = definePlugin({
	ctor: TSkeletonLayoutPlugin,
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
