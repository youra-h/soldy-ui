import { describe, it, expect, vi } from 'vitest'
import { flushSync } from 'svelte'
import { TAlertDialog, type TActionEvent } from '@soxa-ui/core'
import Harness from './AlertDialog.test.svelte'
import { mount, nextFrame } from './mount'
const button = (selector: string) => {
	const node = document.querySelector(selector)
	if (!(node instanceof HTMLButtonElement)) throw new Error(selector)
	return node
}
describe('AlertDialog', () => {
	it('localizes cancellation and retains custom action and veto', async () => {
		const ctrl = new TAlertDialog({ visible: true })
		const confirm = vi.fn((event: TActionEvent) => event.preventDefault())
		mount(Harness, { dialog: { ctrl, onConfirm: confirm } })
		await nextFrame()
		expect(button('.so-alert-dialog__cancel').textContent).toBe('Отмена')
		expect(button('.so-alert-dialog__action').textContent).toBe('Delete')
		button('.so-alert-dialog__action').click()
		flushSync()
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(ctrl.visible).toBe(true)
	})
	it.each([0, 1, 3])('explicit footer has %s actions', async (count) => {
		const confirm = vi.fn()
		mount(Harness, { count, dialog: { visible: true, onConfirm: confirm } })
		await nextFrame()
		expect(document.querySelectorAll('.so-alert-dialog__footer button')).toHaveLength(count)
		expect(document.querySelector('.so-alert-dialog__cancel')).toBeNull()
		if (count) {
			button('.so-alert-dialog__footer button').click()
			flushSync()
			expect(confirm).toHaveBeenCalledTimes(1)
		}
	})
})
