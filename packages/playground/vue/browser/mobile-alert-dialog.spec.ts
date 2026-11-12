import { afterEach, it, expect } from 'vitest'
import { commands } from 'vitest/browser'
import { h, defineComponent } from 'vue'
import { AlertDialog } from '@soxa-ui/vue'
import { TAlertDialog } from '@soxa-ui/core'
import { render, cleanup } from './render'
import { expectInsideWindow } from './viewport'
import '@soxa-ui/theme-oren'
afterEach(cleanup)
it('keeps long confirmation content and both actions inside a mobile viewport and confirms by touch', async () => {
	const ctrl = new TAlertDialog({ visible: true })
	render(
		defineComponent({
			render: () =>
				h(
					AlertDialog,
					{ ctrl },
					{
						title: () => 'Delete the selected record?',
						default: () => 'This cannot be undone. '.repeat(100),
						action: () => 'Delete this record permanently',
					},
				),
		}),
	)
	await expect.poll(() => document.querySelector('.so-alert-dialog')).not.toBeNull()
	const panel = document.querySelector('.so-alert-dialog')
	if (!(panel instanceof HTMLElement)) throw new Error('Panel missing')
	expect(window.innerWidth).toBeLessThanOrEqual(390)
	expectInsideWindow(panel, 'confirmation panel')
	expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth)
	for (const selector of ['.so-alert-dialog__cancel', '.so-alert-dialog__action']) {
		const button = panel.querySelector(selector)
		if (!button) throw new Error(selector)
		expectInsideWindow(button, selector)
	}
	await commands.tap('.so-alert-dialog__action')
	expect(ctrl.visible).toBe(false)
})
