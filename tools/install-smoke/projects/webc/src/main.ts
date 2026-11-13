import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import { TButtonElement, TCheckBoxElement, TDialogElement } from '@soxa-ui/webc'

import '@soxa-ui/theme-oren'

useIcons(material)
useTheme(oren)

// As the README of the adapter writes it: `instanceof` with the element class
// gives the element with its props
const dialog = document.getElementById('settings')

document.getElementById('open')?.addEventListener('click', () => {
	if (dialog instanceof TDialogElement) {
		dialog.visible = true
	}
})

const typed = document.createElement('button', { is: 'so-button' })

if (typed instanceof TButtonElement) {
	// @ts-expect-error `text` is a string: the adapter's types reach the project
	typed.text = 1
}

// Reproduce #860 on installed, production-built packages before the first frame.
await customElements.whenDefined('so-check-box')
for (const checkbox of Array.from(document.querySelectorAll('[is="so-check-box"]'))) {
	if (!(checkbox instanceof TCheckBoxElement)) throw new Error('Checkbox was not upgraded')
	const mode = checkbox.readonly ? 'readonly' : checkbox.disabled ? 'disabled' : 'editable'
	if (checkbox.ctrl?.ready) throw new Error('Expected activation before the first frame')
	Object.assign(checkbox, {
		value: false,
		indeterminate: true,
		readonly: mode === 'readonly',
		disabled: mode === 'disabled',
	})
	await Promise.resolve()

	const input = checkbox.querySelector('input')
	if (!input) throw new Error('Missing checkbox input')
	let changes = 0
	checkbox.addEventListener('so:change:value', () => {
		changes += 1
	})
	input.click()
	const editable = mode === 'editable'
	if (
		checkbox.value !== editable ||
		input.checked !== editable ||
		checkbox.indeterminate !== !editable ||
		input.indeterminate !== !editable ||
		changes !== (editable ? 1 : 0)
	)
		throw new Error(`Early checkbox activation failed: ${mode}`)
}
