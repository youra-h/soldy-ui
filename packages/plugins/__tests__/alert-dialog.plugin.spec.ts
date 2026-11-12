// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest'
import { TAlertDialog } from '@soxa-ui/core'
import {
	TAlertDialogFocusPlugin,
	TAlertDialogNamesPlugin,
	TElementPlugin,
	TPluginBundle,
	TLocaleSource,
	enUS,
	ruRU,
	extendLocale,
	type TLocale,
} from '../src'
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
afterEach(() => {
	document.body.innerHTML = ''
})
describe('AlertDialog plugins', () => {
	it.each([
		'<div class="so-alert-dialog__footer"><button class="so-alert-dialog__cancel">Cancel</button><button>Confirm</button></div>',
		'<div class="so-alert-dialog__body"><div hidden><button class="so-alert-dialog__cancel">Nested cancel</button></div></div><div class="so-alert-dialog__footer"><button class="so-alert-dialog__cancel">Own cancel</button></div>',
		'<button>Custom action</button>',
		'<div class="so-alert-dialog__footer"><button class="so-alert-dialog__cancel" disabled>Cancel</button></div>',
	])('starts safely for %s and returns focus', async (content) => {
		const opener = document.createElement('button')
		const panel = document.createElement('div')
		panel.tabIndex = -1
		panel.innerHTML = content
		document.body.append(opener, panel)
		opener.focus()
		const owner = new TAlertDialog()
		const bundle = new TPluginBundle(owner)
			.use(TElementPlugin)
			.use(TAlertDialogFocusPlugin, { property: 'visible', modal: true })
		const element = bundle.get(TElementPlugin)
		if (!element) throw new Error('Element plugin missing')
		element.element = panel
		await frame()
		owner.visible = true
		await frame()
		const cancel = panel.querySelector(
			':scope > .so-alert-dialog__footer > button.so-alert-dialog__cancel:not(:disabled)',
		)
		expect(document.activeElement).toBe(cancel ?? panel)
		owner.cancel()
		expect(document.activeElement).toBe(opener)
		bundle.destroy()
	})
	it('keeps old complete custom locales compatible and merges partial overrides', () => {
		const { alertDialog: _omitted, ...translations } = ruRU.translations
		const old: TLocale = { tag: 'ru-RU', translations }
		const locale = new TLocaleSource(old)
		const bundle = new TPluginBundle(new TAlertDialog(), undefined, locale).use(
			TAlertDialogNamesPlugin,
		)
		const names = bundle.get(TAlertDialogNamesPlugin)
		expect(names?.confirm).toBe('Confirm')
		locale.locale = extendLocale(enUS, { translations: { alertDialog: { confirm: 'Delete' } } })
		expect(names?.confirm).toBe('Delete')
		expect(names?.cancel).toBe('Cancel')
		locale.locale = ruRU
		expect(names?.cancel).toBe('Отмена')
		bundle.destroy()
	})
})
