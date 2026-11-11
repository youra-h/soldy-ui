import type { TScenario } from '../types'

export const SEPARATOR_SCENARIOS: readonly TScenario[] = [
	{
		id: 'separator/events/semantics',
		component: 'separator',
		topic: 'events',
		kind: 'auto',
		title: 'Separator: semantic and decorative boundaries',
		description: 'The axis survives decorative mode and produces one accessible boundary.',
		props: { orientation: 'horizontal', decorative: false },
		run: async (ctx) => {
			ctx.instance.decorative = true
			ctx.instance.orientation = 'vertical'
			await ctx.frame()
			const decorativeRoot = ctx.scene.querySelector('.so-separator')
			ctx.check(
				decorativeRoot?.getAttribute('role') === 'none' &&
					!decorativeRoot.hasAttribute('aria-orientation'),
				'Decorative boundaries have no ARIA axis',
			)

			ctx.instance.decorative = false
			await ctx.frame()
			const root = ctx.scene.querySelector('.so-separator')
			ctx.check(
				root?.getAttribute('role') === 'separator' &&
					root.getAttribute('aria-orientation') === 'vertical',
				'Restoring semantics keeps the latest axis',
			)
			ctx.check(
				root?.children.length === 0 && !root.hasAttribute('tabindex'),
				'A boundary has neither content nor a tab stop',
			)
		},
	},
]
