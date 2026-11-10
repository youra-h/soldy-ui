import { it, expect } from 'vitest'
import { Component } from '@angular/core'
import { TToggleButtonComponent, TToggleGroupComponent, SlotDirective } from '../src'
import { mountHost, nextFrame, findIn } from './mount'

@Component({
	imports: [TToggleButtonComponent, TToggleGroupComponent],
	template:
		'<button so-toggle-button>Bold</button><div so-toggle-group mode="multiple" [items]="items"></div>',
})
class Host {
	items = [{ text: 'Bold' }, { text: 'Italic' }]
}

it('renders standalone and collection buttons with pressed state', async () => {
	const fixture = mountHost(Host)
	await nextFrame()
	fixture.detectChanges()
	const root = findIn(fixture, 'button[so-toggle-button]', HTMLButtonElement)
	const group = findIn(fixture, '[so-toggle-group]', HTMLElement)
	expect(
		[...group.querySelectorAll('button')].map((button) => button.textContent?.trim()),
	).toEqual(['Bold', 'Italic'])
	root.click()
	group.querySelectorAll('button').forEach((button) => button.click())
	await Promise.resolve()
	fixture.detectChanges()

	expect(root.getAttribute('aria-pressed')).toBe('true')
	expect(root.type).toBe('button')
	expect(
		[...group.querySelectorAll('button')].map((button) => button.getAttribute('aria-pressed')),
	).toEqual(['true', 'true'])
})

@Component({
	imports: [TToggleButtonComponent, TToggleGroupComponent, SlotDirective],
	template: `
		<button so-toggle-button text="Bold">
			<ng-template slot="default" let-text="text">{{ text }} custom</ng-template>
		</button>
		<div so-toggle-group [items]="items">
			<ng-template slot="item-leading">Start</ng-template>
			<ng-template slot="item" let-text="text">Custom {{ text }}</ng-template>
			<ng-template slot="item-trailing">End</ng-template>
		</div>
	`,
})
class SlotHost {
	items = [{ text: 'Italic' }]
}

it('relays item slots and renders the standalone scoped default once', async () => {
	const fixture = mountHost(SlotHost)
	await nextFrame()
	fixture.detectChanges()
	const standalone = findIn(fixture, '[so-toggle-button]', HTMLElement)
	const item = findIn(fixture, '.so-toggle-group-item', HTMLElement)

	expect(standalone.textContent?.trim()).toBe('Bold custom')
	expect(item.textContent?.replace(/\s+/g, ' ').trim()).toBe('StartCustom ItalicEnd')
})

@Component({
	imports: [TToggleButtonComponent],
	template:
		'<form (submit)="submit($event)"><button so-toggle-button type="submit" name="action" value="bold" formmethod="post">Bold</button></form>',
})
class FormHost {
	submitter: HTMLElement | null = null
	submit(event: SubmitEvent): void {
		event.preventDefault()
		this.submitter = event.submitter
	}
}

it('preserves native submit overrides and submitter', async () => {
	const fixture = mountHost(FormHost)
	await nextFrame()
	const button = findIn(fixture, 'button', HTMLButtonElement)
	button.click()
	await Promise.resolve()

	expect(fixture.componentInstance.submitter).toBe(button)
	expect(button.type).toBe('submit')
	expect(button.name).toBe('action')
	expect(button.value).toBe('bold')
	// jsdom lacks formMethod reflection; the browser spec checks the native property.
	expect(button.getAttribute('formmethod')).toBe('post')
})
