import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import { TButtonElement, TDialogElement } from '@soxa-ui/webc'

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
