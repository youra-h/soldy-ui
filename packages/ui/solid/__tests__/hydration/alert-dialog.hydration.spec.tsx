import { it, expect } from 'vitest'
import { AlertDialogPage } from './pages'
import { hydrateServed, markupOf, serve } from './serve'
import { nextFrame } from '../mount'
it('hydrates an open alert without a server portal or mismatch', async () => {
	const html = markupOf('alert-dialog')
	expect(html).not.toContain('so-alert-dialog')
	const container = serve(html)
	hydrateServed(container, () => <AlertDialogPage />)
	await nextFrame()
	await nextFrame()
	const panel = document.querySelector('.so-alert-dialog')
	expect(panel?.getAttribute('role')).toBe('alertdialog')
	expect(document.activeElement).toBe(panel?.querySelector('.so-alert-dialog__cancel'))
})
