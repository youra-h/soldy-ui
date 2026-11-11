import { describe, it, expect } from 'vitest'
import { Component } from '@angular/core'
import { TAlertComponent, AttributesDirective } from '@soxa-ui/angular'
import { TAlert } from '@soxa-ui/core'
import { findIn, find, mountHost } from './mount'

@Component({
	imports: [TAlertComponent, AttributesDirective],
	template:
		'<form (submit)="submitted($event)"><div so-alert [ctrl]="ctrl" [so-attributes]="roleSet"><strong slot="title">Saved</strong><input value="retained" /><button slot="action" type="button">Undo</button></div><div so-alert>Urgent</div></form>',
})
class AlertHost {
	readonly roleSet = { role: 'status' }
	readonly ctrl = new TAlert({ closable: true })
	submits = 0

	submitted(event: Event): void {
		event.preventDefault()
		this.submits++
	}
}

describe('Alert', () => {
	it('honors the published attribute override, projects content and restores a cancelled/hidden alert', () => {
		const fixture = mountHost(AlertHost)
		const ctrl = fixture.componentInstance.ctrl
		let blocked = true
		ctrl.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		const root = findIn(fixture, '.so-alert', HTMLElement)
		const close = find(root, '.so-alert__close', HTMLButtonElement)
		const input = find(root, 'input', HTMLInputElement)

		expect(root.getAttribute('role')).toBe('status')
		expect(fixture.nativeElement.querySelectorAll('.so-alert')[1].getAttribute('role')).toBe(
			'alert',
		)
		expect(close.type).toBe('button')

		close.click()
		fixture.detectChanges()

		expect(ctrl.visible).toBe(true)
		expect(fixture.componentInstance.submits).toBe(0)

		blocked = false
		close.click()
		fixture.detectChanges()

		expect(root.style.display).toBe('none')

		ctrl.show()
		fixture.detectChanges()

		expect(root.style.display).not.toBe('none')
		expect(find(root, 'input', HTMLInputElement)).toBe(input)
	})
})
