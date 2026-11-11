import { afterEach, describe, it, expect } from 'vitest'
import { TAlertElement } from '@soxa-ui/webc'

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))
afterEach(() => {
	document.body.innerHTML = ''
})

describe('Alert', () => {
	it('keeps native role and slots through reversible dismissal without submitting forms', async () => {
		const form = document.createElement('form')
		const root = document.createElement('div', { is: 'so-alert' })

		if (!(root instanceof TAlertElement)) throw new Error('Alert not registered')

		root.closable = true
		root.setAttribute('role', 'status')

		const input = document.createElement('input')
		const action = document.createElement('button')
		action.type = 'button'
		action.slot = 'action'
		action.textContent = 'Undo'
		root.append(input, action)
		form.append(root)
		document.body.append(form)
		await flush()

		const ctrl = root.ctrl

		if (!ctrl) throw new Error('Alert not mounted')

		let blocked = true
		let submits = 0
		form.addEventListener('submit', (event) => {
			event.preventDefault()
			submits++
		})
		ctrl.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		const close = root.querySelector('.so-alert__close')

		if (!(close instanceof HTMLButtonElement)) throw new Error('Missing close button')

		expect(root.getAttribute('role')).toBe('status')
		expect(close.type).toBe('button')

		action.click()
		close.click()
		await flush()

		expect(ctrl.visible).toBe(true)
		expect(submits).toBe(0)

		blocked = false
		close.click()
		await flush()

		expect(root.style.display).toBe('none')

		ctrl.show()
		await flush()

		expect(root.style.display).not.toBe('none')
		expect(root.querySelector('input')).toBe(input)
	})
})
