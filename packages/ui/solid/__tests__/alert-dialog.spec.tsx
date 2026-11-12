import { describe, it, expect, vi } from 'vitest'

import { AlertDialog, Button, LocaleProvider } from '@soxa-ui/solid'
import { TAlertDialog, type TActionEvent } from '@soxa-ui/core'
import { ruRU } from '@soxa-ui/plugins'
import { mount, nextFrame } from './mount'
const button = (selector: string) => {
	const node = document.querySelector(selector)
	if (!(node instanceof HTMLButtonElement)) throw new Error(selector)
	return node
}
describe('AlertDialog', () => {
	it('localizes defaults and delivers synchronous veto', async () => {
		const ctrl = new TAlertDialog({ visible: true })
		const confirm = vi.fn((event: TActionEvent) => event.preventDefault())
		mount(() => (
			<LocaleProvider locale={ruRU}>
				<AlertDialog ctrl={ctrl} title="Delete?" onConfirm={confirm}>
					Cannot undo
				</AlertDialog>
			</LocaleProvider>
		))
		await nextFrame()
		expect(button('.so-alert-dialog__cancel').textContent).toBe('Отмена')
		expect(button('.so-alert-dialog__action').textContent).toBe('Подтвердить')
		button('.so-alert-dialog__action').click()
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(ctrl.visible).toBe(true)
	})
	it.each([0, 1, 3])('footer with %s actions replaces defaults', async (count) => {
		const confirm = vi.fn()
		mount(() => (
			<AlertDialog
				visible
				title="Delete?"
				onConfirm={confirm}
				footer={({ confirm: choose }) =>
					Array.from({ length: count }, (_, i) => <Button onClick={choose}>{i}</Button>)
				}
			/>
		))
		await nextFrame()
		expect(document.querySelectorAll('.so-alert-dialog__footer button')).toHaveLength(count)
		expect(document.querySelector('.so-alert-dialog__cancel')).toBeNull()
		if (count) {
			button('.so-alert-dialog__footer button').click()
			expect(confirm).toHaveBeenCalledTimes(1)
		}
	})
})
