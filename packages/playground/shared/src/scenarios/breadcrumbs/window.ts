import type { TScenario } from '../types'

export const BREADCRUMBS_SCENARIOS: readonly TScenario[] = [
	{
		id: 'breadcrumbs/events/window',
		component: 'breadcrumbs',
		topic: 'events',
		kind: 'auto',
		title: 'Предел цепочки',
		description:
			'Предел включает многоточие; 0 показывает все звенья, текущим остаётся последнее',
		props: { maxItems: 3 },
		run: async (ctx) => {
			ctx.check(
				ctx.scene.querySelectorAll('ol > li').length === 3,
				'Три видимые позиции вместе с многоточием',
			)
			ctx.instance.maxItems = 0
			await ctx.frame()
			ctx.check(
				ctx.scene.querySelectorAll('ol > li').length === 6,
				'Без предела видны все шесть звеньев',
			)
			ctx.check(
				ctx.scene.querySelectorAll('[aria-current="page"]').length === 1,
				'Текущая страница ровно одна',
			)
		},
	},
]
