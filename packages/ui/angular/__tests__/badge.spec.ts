import { describe, it, expect } from 'vitest'
import { Component, signal } from '@angular/core'
import { TBadgeComponent } from '@soxa-ui/angular'
import { find, findIn, mountHost } from './mount'

@Component({
	imports: [TBadgeComponent],
	template:
		'<span so-badge [value]="value()" [max]="max()" [dot]="dot()" [aria_label]="label()" [aria_labelledBy]="labelledBy()"><button slot="anchor" (click)="clicks = clicks + 1">Inbox</button></span>',
})
class BadgeHost {
	readonly value = signal<string | number>(120)
	readonly max = signal(99)
	readonly dot = signal(false)
	readonly label = signal<string | undefined>(undefined)
	readonly labelledBy = signal<string | undefined>(undefined)

	clicks = 0
}
describe('Badge', () => {
	it('updates text and semantics without replacing its anchor', () => {
		const fixture = mountHost(BadgeHost),
			host = fixture.componentInstance

		const root = findIn(fixture, '[so-badge]', HTMLElement)
		const indicator = () => find(root, '.so-badge__indicator', HTMLElement)
		const button = find(root, 'button', HTMLButtonElement)

		expect(indicator().textContent).toBe('99+')

		host.dot.set(true)
		host.label.set('120 unread')
		fixture.detectChanges()

		expect(indicator().getAttribute('role')).toBe('img')
		expect(indicator().getAttribute('aria-label')).toBe('120 unread')
		expect(root.getAttribute('aria-label')).toBeNull()
		expect(find(root, 'button', HTMLButtonElement)).toBe(button)

		button.click()
		button.focus()

		expect(host.clicks).toBe(1)
		expect(document.activeElement).toBe(button)

		host.label.set(undefined)
		fixture.detectChanges()

		expect(indicator().getAttribute('aria-hidden')).toBe('true')

		host.dot.set(false)
		host.value.set(0)
		host.labelledBy.set('name')
		fixture.detectChanges()

		expect(indicator().textContent).toBe('0')
		expect(indicator().getAttribute('role')).toBe('img')

		host.labelledBy.set(undefined)
		host.value.set('120')
		fixture.detectChanges()

		expect(indicator().textContent).toBe('120')
		expect(indicator().getAttribute('role')).toBeNull()

		host.value.set(120)
		host.max.set(9)
		fixture.detectChanges()

		expect(indicator().textContent).toBe('9+')
	})
})
