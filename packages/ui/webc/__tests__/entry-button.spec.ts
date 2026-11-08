/**
 * The entry of one element: `import '@soxa-ui/webc/button'` defines the
 * button and the locale provider, which comes with every entry (the adapter
 * defines it), and no other element — a page with one button does not ship
 * the rest of the library. The file imports nothing else of the package, and a
 * test file runs in a document, and a registry, of its own.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { TButton } from '@soxa-ui/core'
import { TButtonElement, type TButtonElementProps } from '@soxa-ui/webc/button'

afterEach(() => {
	document.body.innerHTML = ''
})

function isButton(node: Element | null): node is TButtonElementProps {
	return node instanceof TButtonElement
}

describe('вход @soxa-ui/webc/button', () => {
	it('определяет кнопку и провайдер локали, других элементов нет', () => {
		expect(customElements.get('so-button')).toBe(TButtonElement)
		expect(customElements.get('so-locale-provider')).toBeDefined()

		for (const name of ['so-icon', 'so-select', 'so-table', 'so-calendar', 'so-menu']) {
			expect(customElements.get(name), name).toBeUndefined()
		}
	})

	it('кнопка из разметки собирается', () => {
		const host = document.body.appendChild(document.createElement('so-locale-provider'))

		host.innerHTML = '<button is="so-button" text="Save"></button>'

		const el = host.querySelector('button')

		if (!isButton(el)) throw new Error('<button is="so-button"> is not a button of soxa')

		expect(el.ctrl).toBeInstanceOf(TButton)
		expect(el.classList).toContain('so-button')
		expect(el.querySelector('.so-button__text')?.textContent).toBe('Save')
	})
})
