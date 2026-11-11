import type { TScenario } from '../types'

export const ALERT_SCENARIOS: readonly TScenario[] = [
	{
		id: 'alert/slots/message',
		component: 'alert',
		topic: 'slots',
		kind: 'auto',
		title: 'Alert: inline content and dismissal',
		description:
			'Content and actions remain in normal document flow; dismissal hides the message.',
		props: { closable: true },
		run: async (ctx) => {
			await ctx.frame()

			const root = ctx.scene.querySelector('.so-alert')
			const close = root?.querySelector('.so-alert__close')

			ctx.check(root?.getAttribute('role') === 'alert', 'Urgency defaults to alert')
			ctx.check(
				Boolean(root?.querySelector('.so-alert__title')?.textContent),
				'Title slot is rendered',
			)
			ctx.check(
				close instanceof HTMLButtonElement && close.type === 'button',
				'Dismissal is not a submit action',
			)
		},
	},
]
