import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AlertDialog, Button, LocaleProvider } from '@soxa-ui/vue'
import { TAlertDialog, type TActionEvent } from '@soxa-ui/core'
import { ruRU, enUS } from '@soxa-ui/plugins'
let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
	wrapper?.unmount()
	document.body.innerHTML = ''
})
const button = (selector: string) => {
	const node = document.querySelector(selector)
	if (!(node instanceof HTMLButtonElement)) throw new Error(selector)
	return node
}
describe('AlertDialog', () => {
	it('localizes actions live and delivers synchronous veto', async () => {
		const ctrl = new TAlertDialog({ visible: true })
		const confirm = vi.fn((event: TActionEvent) => event.preventDefault())
		wrapper = mount(LocaleProvider, {
			props: { locale: ruRU },
			slots: {
				default: () =>
					h(
						AlertDialog,
						{ ctrl, onConfirm: confirm },
						{ title: () => 'Delete?', default: () => 'Cannot undo' },
					),
			},
			attachTo: document.body,
		})
		await nextTick()
		const panel = document.querySelector('.so-alert-dialog')
		expect(panel?.getAttribute('role')).toBe('alertdialog')
		expect(
			document.getElementById(panel?.getAttribute('aria-describedby') ?? '')?.textContent,
		).toBe('Cannot undo')
		expect(button('.so-alert-dialog__cancel').textContent).toBe('Отмена')
		expect(button('.so-alert-dialog__action').textContent).toBe('Подтвердить')
		button('.so-alert-dialog__action').click()
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(ctrl.visible).toBe(true)
		await wrapper.setProps({ locale: enUS })
		expect(button('.so-alert-dialog__cancel').textContent).toBe('Cancel')
	})
	it.each([0, 1, 3])('footer with %s actions replaces defaults', async (count) => {
		wrapper = mount(AlertDialog, {
			props: { visible: true },
			slots: {
				title: () => 'Delete?',
				footer: ({ confirm }) =>
					Array.from({ length: count }, (_, i) =>
						h(Button, { onClick: confirm }, () => String(i)),
					),
			},
			attachTo: document.body,
		})
		await nextTick()
		expect(document.querySelectorAll('.so-alert-dialog__footer button')).toHaveLength(count)
		expect(document.querySelector('.so-alert-dialog__cancel')).toBeNull()
		expect(document.querySelector('.so-alert-dialog__close')).not.toBeNull()
		if (count) {
			button('.so-alert-dialog__footer button').click()
			expect(wrapper.emitted('confirm')).toHaveLength(1)
		}
	})
	it('action and cancel slots preserve buttons and choices', async () => {
		wrapper = mount(AlertDialog, {
			props: { visible: true },
			slots: { title: () => 'Delete?', action: () => 'Delete', cancel: () => 'Keep' },
			attachTo: document.body,
		})
		await nextTick()
		expect(button('.so-alert-dialog__action').textContent).toBe('Delete')
		button('.so-alert-dialog__cancel').click()
		expect(wrapper.emitted('cancel')).toHaveLength(1)
		expect(wrapper.emitted('confirm')).toBeUndefined()
	})
})
