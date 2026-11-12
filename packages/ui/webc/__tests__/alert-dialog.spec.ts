import { afterEach, describe, it, expect, vi } from 'vitest'
import { TAlertDialog } from '@soxa-ui/core'
import { TAlertDialogElement } from '@soxa-ui/webc'
const flush = async () => {
	await new Promise<void>((resolve) => queueMicrotask(resolve))
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}
const button = (selector: string) => {
	const node = document.querySelector(selector)
	if (!(node instanceof HTMLButtonElement)) throw new Error(selector)
	return node
}
async function render(footer = '') {
	const place = document.createElement('div')
	place.innerHTML =
		'<div is="so-alert-dialog"><span slot="title">Delete?</span>Cannot undo<span slot="action">Delete</span>' +
		footer +
		'</div>'
	const element = place.querySelector('div')
	if (!(element instanceof TAlertDialogElement)) throw new Error('AlertDialog missing')
	const ctrl = new TAlertDialog({ visible: true })
	element.ctrl = ctrl
	document.body.append(place)
	await flush()
	return { element, ctrl }
}
afterEach(() => {
	document.body.innerHTML = ''
})
describe('AlertDialog', () => {
	it('keeps custom action and forwards synchronous choice veto', async () => {
		const { element, ctrl } = await render()
		const confirm = vi.fn((event: Event) => {
			if (event instanceof CustomEvent) event.detail.preventDefault()
		})
		element.addEventListener('so:confirm', confirm)
		expect(button('.so-alert-dialog__cancel').textContent).toBe('Cancel')
		expect(button('.so-alert-dialog__action').textContent).toBe('Delete')
		button('.so-alert-dialog__action').click()
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(ctrl.visible).toBe(true)
	})
	it.each([0, 1, 3])('footer with %s actions replaces defaults', async (count) => {
		const { element, ctrl } = await render(
			'<div slot="footer">' +
				'<button type="button">Choose</button>'.repeat(count) +
				'</div>',
		)
		const confirm = vi.fn()
		element.addEventListener('so:confirm', confirm)
		expect(document.querySelectorAll('.so-alert-dialog__footer button')).toHaveLength(count)
		expect(document.querySelector('.so-alert-dialog__cancel')).toBeNull()
		if (count) {
			button('.so-alert-dialog__footer button').addEventListener('click', () =>
				ctrl.confirm(),
			)
			button('.so-alert-dialog__footer button').click()
			expect(confirm).toHaveBeenCalledTimes(1)
		}
	})
})
