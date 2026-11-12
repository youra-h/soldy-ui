import { describe, it, expect, vi } from 'vitest'
import { TAlertDialog, TDialog } from '@soxa-ui/core'

describe('AlertDialog choices', () => {
	it('is a hidden modal alert with independent Dialog compatibility', () => {
		const dialog = new TAlertDialog()

		expect(dialog.visible).toBe(false)
		expect(dialog.aria.toObject()).toMatchObject({ role: 'alertdialog', 'aria-modal': 'true' })
		expect(dialog.classes.toArray()).toContain('so-alert-dialog')
		expect(new TDialog({ alert: true }).aria.get('role')).toBe('alertdialog')
	})

	it.each(['confirm', 'cancel'] as const)(
		'%s reports once, then requests closing; reopening accepts a fresh choice',
		(choice) => {
			const dialog = new TAlertDialog({ visible: true })
			const chosen = vi.fn(() => dialog[choice]())
			const close = vi.fn()

			dialog.events.on(choice, chosen)
			dialog.events.on('close:before', close)
			dialog[choice]()
			dialog[choice]()
			expect(chosen).toHaveBeenCalledTimes(1)
			expect(close).toHaveBeenCalledTimes(1)
			expect(dialog.visible).toBe(false)
			dialog.visible = true
			dialog[choice]()
			expect(chosen).toHaveBeenCalledTimes(2)
		},
	)

	it.each(['confirm', 'cancel'] as const)('%s can veto closing for async work', (choice) => {
		const dialog = new TAlertDialog({ visible: true })
		const close = vi.fn()

		dialog.events.on(choice, (event) => event.preventDefault())
		dialog.events.on('close:before', close)
		dialog[choice]()
		expect(dialog.visible).toBe(true)
		expect(close).not.toHaveBeenCalled()
	})

	it('close:before can prevent closing after the choice', () => {
		const dialog = new TAlertDialog({ visible: true })
		const confirm = vi.fn()

		dialog.events.on('confirm', confirm)
		dialog.events.on('close:before', (event) => event.preventDefault())
		dialog.confirm()
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(dialog.visible).toBe(true)
	})

	it('backdrop and programmatic hiding never choose; Escape and cross cancel', () => {
		const dialog = new TAlertDialog({ visible: true })
		const confirm = vi.fn()
		const cancel = vi.fn()

		dialog.events.on('confirm', confirm)
		dialog.events.on('cancel', cancel)
		dialog.requestClose('outside')
		expect(dialog.visible).toBe(true)
		dialog.visible = false
		expect(cancel).not.toHaveBeenCalled()
		dialog.visible = true
		dialog.dismissible = false
		dialog.requestClose('escape')
		expect(cancel).not.toHaveBeenCalled()
		dialog.requestClose('button')
		expect(cancel).toHaveBeenCalledTimes(1)
		dialog.visible = true
		dialog.dismissible = true
		dialog.requestClose('escape')
		expect(cancel).toHaveBeenCalledTimes(2)
		expect(confirm).not.toHaveBeenCalled()
	})
})
