import type { TScenario } from '../types'

export const BREADCRUMBS_SCENARIOS: readonly TScenario[] = [
	{
		id: 'breadcrumbs/events/window',
		component: 'breadcrumbs',
		topic: 'events',
		kind: 'auto',
		title: 'Предел цепочки',
		description:
			'Предел включает многоточие; 0 показывает все звенья, текущим остаётся активный элемент',
		props: { maxItems: 3 },
		run: async (ctx) => {
			const visiblePositions = () =>
				[
					...ctx.scene.querySelectorAll(
						'.so-breadcrumbs__link, .so-breadcrumbs__trigger',
					),
				].filter((node) => node.getClientRects().length > 0)

			ctx.check(visiblePositions().length === 3, 'Три видимые позиции вместе с многоточием')
			ctx.instance.maxItems = 0
			await ctx.frame()
			ctx.check(visiblePositions().length === 6, 'Без предела видны все шесть звеньев')
			ctx.check(
				ctx.scene.querySelectorAll('[aria-current="page"]').length === 1,
				'Текущая страница ровно одна',
			)
		},
	},
]
