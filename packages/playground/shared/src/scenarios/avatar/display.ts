import type { TScenario } from '../types'
export const AVATAR_SCENARIOS: readonly TScenario[] = [
	{
		id: 'avatar/slots/fallback',
		component: 'avatar',
		fixture: 'avatar-fallback',
		topic: 'slots',
		kind: 'auto',
		title: 'Avatar: custom Icon fallback',
		description: 'The fallback slot replaces the initials',
		props: { initials: 'AL', aria_label: 'Ada' },
		run: async (ctx) => {
			await ctx.frame()
			ctx.check(
				Boolean(ctx.scene.querySelector('.so-avatar__fallback .so-icon')),
				'Real Icon rendered',
			)
			ctx.check(!ctx.scene.textContent?.includes('AL'), 'Initials replaced')
		},
	},
	...['AL', '\u{1f469}\u{1f3fd}\u200d\u{1f4bb} e\u0301'].map((initials, index): TScenario => ({
		id: 'avatar/slots/initials-' + index,
		component: 'avatar',
		topic: 'slots',
		kind: 'auto',
		title: 'Avatar: initials ' + index,
		description: 'Initials remain exactly as supplied',
		props: { initials, aria_label: 'User' },
		run: async (ctx) => {
			await ctx.frame()
			ctx.check(
				ctx.scene.querySelector('.so-avatar__fallback')?.textContent === initials,
				'Formatted initials remain exact',
			)
		},
	})),
	...[0, 3, -1, 1.5].map((overflow): TScenario => ({
		id: 'avatar-group/slots/overflow-' + overflow,
		component: 'avatar-group',
		topic: 'slots',
		kind: 'auto',
		title: 'Avatar.Group: ' + overflow,
		description: 'Explicit overflow never trims the three children',
		props: { overflow },
		run: async (ctx) => {
			await ctx.frame()
			ctx.check(ctx.scene.querySelectorAll('.so-avatar').length === 3, 'All children remain')
			ctx.check(
				(ctx.scene.querySelector('.so-avatar-group__count')?.textContent ?? '') ===
					(overflow === 3 ? '+3' : ''),
				'Only a positive integer produces a count',
			)
		},
	})),
]
