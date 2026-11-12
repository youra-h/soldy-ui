import { afterEach, describe, it, expect, vi } from 'vitest'
import { Component, input } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { TAlertDialog, type TActionEvent } from '@soxa-ui/core'
import {
	LocaleProviderDirective,
	SlotDirective,
	TAlertDialogComponent,
	TButtonComponent,
} from '@soxa-ui/angular'
import { ruRU } from '@soxa-ui/plugins'
import { nextFrame } from './mount'
@Component({
	imports: [LocaleProviderDirective, TAlertDialogComponent],
	template:
		'<ng-container so-locale-provider [locale]="locale"><div so-alert-dialog [ctrl]="ctrl" (soConfirm)="confirm($event)"><span slot="title">Delete?</span>Cannot undo<span slot="action">Delete</span></div></ng-container>',
})
class Defaults {
	readonly locale = ruRU
	readonly ctrl = new TAlertDialog({ visible: true })
	readonly confirm = vi.fn((event: TActionEvent) => event.preventDefault())
}
@Component({
	imports: [TAlertDialogComponent, TButtonComponent, SlotDirective],
	template:
		'<div so-alert-dialog [ctrl]="ctrl" (soConfirm)="confirm()"><span slot="title">Delete?</span><ng-template slot="footer" let-confirm="confirm">@for (i of indices(); track i) { <button so-button type="button" (click)="confirm()">{{ i }}</button> }</ng-template></div>',
})
class Footer {
	readonly indices = input<readonly number[]>([])
	readonly ctrl = new TAlertDialog({ visible: true })
	readonly confirm = vi.fn()
}
const button = (selector: string) => {
	const node = document.querySelector(selector)
	if (!(node instanceof HTMLButtonElement)) throw new Error(selector)
	return node
}
afterEach(() => {
	TestBed.resetTestingModule()
	document.body.innerHTML = ''
})
describe('AlertDialog', () => {
	it('localizes safe action and sends cancellable confirmation', async () => {
		const fixture = TestBed.createComponent(Defaults)
		fixture.detectChanges()
		await fixture.whenStable()
		await nextFrame()
		expect(button('.so-alert-dialog__cancel').textContent?.trim()).toBe('Отмена')
		expect(button('.so-alert-dialog__action').textContent?.trim()).toBe('Delete')
		button('.so-alert-dialog__action').click()
		expect(fixture.componentInstance.confirm).toHaveBeenCalledTimes(1)
		expect(fixture.componentInstance.ctrl.visible).toBe(true)
	})
	it.each([0, 1, 3])('explicit footer has %s actions', async (count) => {
		const fixture = TestBed.createComponent(Footer)
		fixture.componentRef.setInput(
			'indices',
			Array.from({ length: count }, (_, i) => i),
		)
		fixture.detectChanges()
		await fixture.whenStable()
		await nextFrame()
		expect(document.querySelectorAll('.so-alert-dialog__footer button')).toHaveLength(count)
		expect(document.querySelector('.so-alert-dialog__cancel')).toBeNull()
		if (count) {
			button('.so-alert-dialog__footer button').click()
			expect(fixture.componentInstance.confirm).toHaveBeenCalledTimes(1)
		}
	})
})
