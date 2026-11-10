import { afterEach, it, expect } from 'vitest'
import { Component } from '@angular/core'
import { TBadgeComponent } from '@soxa-ui/angular'
import { hydrate, leavePage, loadPage, renderOnServer } from './server'

@Component({
	selector: 'app-root',
	imports: [TBadgeComponent],
	template:
		'<span so-badge [value]="120" aria_label="120 unread"><button slot="anchor">Inbox</button></span>',
})
class BadgePage {}
afterEach(leavePage)
it('hydrates the server Badge indicator and anchor in place', async () => {
	const html = await renderOnServer(BadgePage)
	expect(html).toContain('99+')
	expect(html).toContain('aria-label="120 unread"')
	loadPage(html)
	const nodes = [...document.querySelectorAll('.so-badge, .so-badge span, button')]
	const app = await hydrate(BadgePage)
	await app.whenStable()
	expect(
		[...document.querySelectorAll('.so-badge, .so-badge span, button')].every(
			(node, i) => node === nodes[i],
		),
	).toBe(true)
	expect(document.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('120 unread')
	expect(document.querySelector('button')?.textContent).toBe('Inbox')
})
