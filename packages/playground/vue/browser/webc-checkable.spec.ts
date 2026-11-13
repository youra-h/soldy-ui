/** Native activation must work as soon as a checkable has assembled, before ready. */
import { afterEach, describe, expect, it } from 'vitest'
import { TCheckBoxElement, TSwitchElement } from '@soxa-ui/webc'

const roots: HTMLElement[] = []

afterEach(() => {
	for (const root of roots.splice(0)) root.remove()
})

describe.each(['so-check-box', 'so-switch'])('%s early native activation (#860)', (is) => {
	it.each(['editable', 'readonly', 'disabled'])('%s before the first frame', async (mode) => {
		const label = document.createElement('label')
		const el = document.createElement('span', { is })

		label.append(el, 'Choice')
		roots.push(label)
		document.body.appendChild(label)

		if (!(el instanceof TCheckBoxElement || el instanceof TSwitchElement)) {
			throw new Error('Missing checkable element')
		}

		// WebKit delivers customized built-in callbacks in microtasks.
		for (let attempt = 0; !el.ctrl && attempt < 10; attempt += 1) await Promise.resolve()

		expect(el.ctrl).toBeDefined()
		el.value = false
		el.readonly = mode === 'readonly'
		el.disabled = mode === 'disabled'
		if (el instanceof TCheckBoxElement) el.indeterminate = true
		await Promise.resolve()

		expect(el.ctrl?.ready).toBe(false)
		const input = el.querySelector('input')
		if (!input) throw new Error('Missing native checkbox')
		const changes: unknown[] = []
		el.addEventListener('so:change:value', (event) => {
			if (event instanceof CustomEvent) changes.push(event.detail)
		})

		input.click()
		const editable = mode === 'editable'
		expect(input.checked).toBe(editable)
		expect(el.value).toBe(editable)
		expect(changes).toEqual(editable ? [{ newValue: true, oldValue: false }] : [])
		if (el instanceof TCheckBoxElement) {
			expect(input.indeterminate).toBe(!editable)
			expect(el.indeterminate).toBe(!editable)
		}
	})
})
