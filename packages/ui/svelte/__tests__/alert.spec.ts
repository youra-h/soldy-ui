import { describe, it, expect } from 'vitest'
import { createRawSnippet, flushSync } from 'svelte'
import { Alert } from '@soxa-ui/svelte'
import { TAlert } from '@soxa-ui/core'
import { mount, find } from './mount'

describe('Alert', () => {
	it('honors native role and dismisses through cancellable hide while retaining content', () => {
		const ctrl = new TAlert({ closable: true })
		let blocked = true
		ctrl.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		const content = createRawSnippet(() => ({ render: () => '<input value="retained" />' }))
		const app = mount(Alert, { ctrl, role: 'status', children: content })
		const root = app.root()
		const close = find(root, '.so-alert__close', HTMLButtonElement)
		const input = find(root, 'input', HTMLInputElement)

		expect(root.getAttribute('role')).toBe('status')
		expect(close.type).toBe('button')

		close.click()
		flushSync()

		expect(ctrl.visible).toBe(true)

		blocked = false
		close.click()
		flushSync()

		expect(root.style.display).toBe('none')

		ctrl.show()
		flushSync()

		expect(root.style.display).not.toBe('none')
		expect(find(root, 'input', HTMLInputElement)).toBe(input)
	})
})
