import { describe, expect, it, vi } from 'vitest'
import { TAlert } from '../src'

describe('Alert model', () => {
	it('keeps urgency independent of theme and exposes dismissal state', () => {
		const alert = new TAlert()
		const changed = vi.fn()
		alert.events.on('change:closable', changed)

		expect(alert.aria.get('role')).toBe('alert')
		expect(alert.closable).toBe(false)

		alert.closable = true
		alert.closable = true

		expect(changed).toHaveBeenCalledOnce()
		expect(alert.dataset.get('closable')).toBe('true')
		expect(alert.getProps()).toMatchObject({ tag: 'div', closable: true })
		expect(alert.aria.get('role')).toBe('alert')
	})

	it('lets consumers cancel or correct dismissal availability before state changes', () => {
		const alert = new TAlert()
		let mode: 'cancel' | 'correct' | 'accept' = 'cancel'
		const changed = vi.fn()
		alert.events.on('change:closable', changed)
		alert.events.on('change:closable:before', (event) => {
			if (mode === 'cancel') event.preventDefault()
			if (mode === 'correct') event.value = false
		})

		alert.closable = true

		expect(alert.closable).toBe(false)

		mode = 'correct'
		alert.closable = true

		expect(alert.dataset.get('closable')).toBe('false')
		expect(changed).not.toHaveBeenCalled()

		mode = 'accept'
		alert.closable = true

		expect(alert.closable).toBe(true)
		expect(changed).toHaveBeenCalledOnce()
	})

	it('uses cancellable hide and can be shown again', () => {
		const alert = new TAlert()
		let blocked = true
		alert.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		alert.hide()

		expect(alert.visible).toBe(true)

		blocked = false
		alert.hide()

		expect(alert.visible).toBe(false)

		alert.show()

		expect(alert.visible).toBe(true)
	})
})
