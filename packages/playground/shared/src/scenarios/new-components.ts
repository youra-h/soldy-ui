import type { TScenario } from './types'

export const NEW_COMPONENT_SCENARIOS: readonly TScenario[] = [
	{
		id: 'alert-dialog/slots/footer',
		component: 'alert-dialog',
		fixture: 'alert-dialog-footer',
		topic: 'slots',
		kind: 'auto',
		title: 'AlertDialog: custom footer',
		description:
			'Consumer footer replaces both default actions and preserves the modal name and description.',
		props: { visible: true },
		run: async (ctx) => {
			await ctx.until(
				() =>
					Boolean(
						document.querySelector(
							'.so-alert-dialog[data-open="true"] [data-audit-footer]',
						),
					),
				'custom footer',
			)
			const panel = document.querySelector('.so-alert-dialog[data-open="true"]')

			ctx.check(
				panel?.querySelectorAll('.so-alert-dialog__cancel,.so-alert-dialog__action')
					.length === 0,
				'Default actions are replaced',
			)
			ctx.check(
				panel?.querySelector('[data-audit-footer]')?.textContent === 'Custom footer',
				'Consumer footer is rendered',
			)
			for (const attribute of ['aria-labelledby', 'aria-describedby'])
				ctx.check(
					Boolean(
						document
							.getElementById(panel?.getAttribute(attribute) ?? '')
							?.textContent?.trim(),
					),
					'Modal keeps ' + attribute,
				)
		},
	},
	{
		id: 'toggle-button/events/audit',
		component: 'toggle-button',
		topic: 'events',
		kind: 'auto',
		title: 'ToggleButton: pressed state',
		description: 'Consumer writes and native clicks reach the same persistent state.',
		props: { text: 'Bold' },
		run: async (ctx) => {
			ctx.instance.pressed = true
			await ctx.until(
				() =>
					ctx.scene.querySelector('.so-toggle-button')?.getAttribute('aria-pressed') ===
					'true',
				'pressed button',
			)
			const button = ctx.scene.querySelector('.so-toggle-button')

			if (!(button instanceof HTMLButtonElement)) throw new Error('Missing ToggleButton')

			button.click()
			await ctx.until(
				() => button.getAttribute('aria-pressed') === 'false',
				'unpressed button',
			)
			ctx.check(ctx.instance.pressed === false, 'Click updates the consumer instance')
		},
	},
	{
		id: 'toggle-group/events/audit',
		component: 'toggle-group',
		topic: 'events',
		kind: 'auto',
		title: 'ToggleGroup: selection',
		description: 'Item activation changes the actual selected state.',
		props: { aria_label: 'Formatting', items: [{ text: 'Bold' }, { text: 'Italic' }] },
		run: async (ctx) => {
			await ctx.frame()
			const button = ctx.scene.querySelector('.so-toggle-group-item')

			if (!(button instanceof HTMLButtonElement)) throw new Error('Missing ToggleGroup item')

			button.click()
			await ctx.until(
				() =>
					ctx.scene
						.querySelector('.so-toggle-group-item')
						?.getAttribute('aria-pressed') === 'true',
				'selected group item',
			)
			ctx.check(
				ctx.scene.querySelector('.so-toggle-group-item')?.getAttribute('aria-pressed') ===
					'true',
				'The selected item has pressed semantics',
			)
		},
	},
	{
		id: 'alert-dialog/events/audit',
		component: 'alert-dialog',
		topic: 'events',
		kind: 'auto',
		title: 'AlertDialog: safe action',
		description: 'Opening focuses Cancel; cancellation closes and emits exactly once.',
		run: async (ctx) => {
			ctx.instance.visible = true
			await ctx.until(
				() => Boolean(document.querySelector('.so-alert-dialog[data-open="true"]')),
				'open alert dialog',
			)
			await ctx.until(
				() =>
					document.activeElement?.classList.contains('so-alert-dialog__cancel') === true,
				'safe initial focus',
			)
			const cancel = document.querySelector(
				'.so-alert-dialog[data-open="true"] .so-alert-dialog__cancel',
			)

			if (!(cancel instanceof HTMLButtonElement)) throw new Error('Missing Cancel action')

			cancel.click()
			await ctx.until(() => ctx.instance.visible === false, 'closed alert dialog')
			ctx.check(ctx.journal.count('cancel') === 1, 'Cancel emitted exactly once')
		},
	},
]
