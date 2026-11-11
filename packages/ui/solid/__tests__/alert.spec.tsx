import { describe, it, expect } from 'vitest'
import { Alert } from '@soxa-ui/solid'
import { TAlert } from '@soxa-ui/core'
import { mount, find } from './mount'

describe('Alert', () => {
	it('honors native role and uses reversible, cancellable hide without form submission', () => {
		const ctrl = new TAlert({ closable: true })
		let blocked = true
		let submits = 0
		ctrl.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		const app = mount(() => (
			<form
				onSubmit={(event) => {
					event.preventDefault()
					submits++
				}}
			>
				<Alert
					ctrl={ctrl}
					role="status"
					title="Notice"
					action={<button type="button">Refresh</button>}
				>
					Content
				</Alert>
			</form>
		))
		const root = find(app.root(), '.so-alert', HTMLElement)
		const close = find(root, '.so-alert__close', HTMLButtonElement)

		expect(root.getAttribute('role')).toBe('status')
		expect(close.type).toBe('button')

		close.click()

		expect(ctrl.visible).toBe(true)
		expect(submits).toBe(0)

		blocked = false
		close.click()

		expect(root.style.display).toBe('none')

		ctrl.show()

		expect(root.style.display).not.toBe('none')
	})
})
