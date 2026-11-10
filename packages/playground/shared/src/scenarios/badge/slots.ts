import type { TScenario } from '../types'

export const BADGE_SLOTS: readonly TScenario[] = [
	...[
		{ key: 'inline', props: { value: 'New' }, text: 'New' },
		{ key: 'cap', props: { value: 120 }, text: '99+' },
		{ key: 'dot', props: { dot: true, aria_label: 'Online' }, text: '' },
		{
			key: 'overlay',
			props: { value: 3, aria_label: '3 unread' },
			text: '3',
			fixture: 'badge-anchor',
		},
	].map(({ key, props, text, ...rest }): TScenario => ({
		id: 'badge/slots/' + key,
		component: 'badge',
		topic: 'slots',
		kind: 'auto',
		title: 'Badge: ' + key,
		description: 'Indicator value and independent anchor content',
		props,
		...rest,
		run: async (ctx) => {
			await ctx.frame()
			const indicator = ctx.scene.querySelector('.so-badge__indicator')
			ctx.check(indicator?.textContent === text, 'Indicator text matches the value')
			if (key === 'overlay') {
				const button = ctx.scene.querySelector('button')
				ctx.check(button?.textContent === 'Inbox', 'Anchor keeps its own label')
			}
		},
	})),
]
