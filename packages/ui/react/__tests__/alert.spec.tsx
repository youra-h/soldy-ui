import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { Alert } from '@soxa-ui/react'
import { TAlert } from '@soxa-ui/core'
import { mount, find, track } from './mount'

describe('Alert', () => {
	it('uses native status, keeps action independent and supports cancellable dismissal', () => {
		const ctrl = new TAlert({ closable: true })
		let blocked = true
		ctrl.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})
		let submits = 0
		const app = mount(
			<form
				onSubmit={(event) => {
					event.preventDefault()
					submits++
				}}
			>
				<Alert
					ctrl={ctrl}
					role="status"
					title="Saved"
					action={<button type="button">Undo</button>}
				>
					Content
				</Alert>
			</form>,
		)
		const root = find(app.root(), '.so-alert', HTMLElement)
		const close = find(root, '.so-alert__close', HTMLButtonElement)

		expect(root.getAttribute('role')).toBe('status')
		expect(close.type).toBe('button')
		expect(close.getAttribute('aria-label')).toBe('Close')

		act(() => close.click())

		expect(ctrl.visible).toBe(true)
		expect(submits).toBe(0)

		blocked = false
		act(() => close.click())

		expect(root.style.display).toBe('none')

		act(() => ctrl.show())

		expect(root.style.display).not.toBe('none')
	})

	it('hydrates server markup with alert semantics and all slots in place', async () => {
		const tree = (
			<Alert closable title="Urgent">
				Message
			</Alert>
		)
		const container = document.createElement('div')
		container.innerHTML = renderToString(tree)
		document.body.append(container)

		const nodes = [...container.querySelectorAll('*')]

		await act(async () => {
			track(hydrateRoot(container, tree))
		})

		expect(container.querySelector('.so-alert')?.getAttribute('role')).toBe('alert')
		expect(
			[...container.querySelectorAll('*')].every((node, index) => node === nodes[index]),
		).toBe(true)
	})
})
