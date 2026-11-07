import { describe, it, expect, expectTypeOf } from 'vitest'
import { Component, signal, viewChild, type EventEmitter } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { TInput, TCheckBox, type TListBoxValue, type TValuePayload } from '@soldy-ui/core'
import { TInputComponent, TCheckBoxComponent, TListBoxComponent } from '@soldy-ui/angular'

@Component({
	standalone: true,
	imports: [TInputComponent, TCheckBoxComponent, TListBoxComponent],
	template: `<div
			so-input
			[ctrl]="ctrl"
			[(value)]="text"
			[(aria_label)]="label"
			(soChangeValue)="events.push($event)"
		></div>
		<label so-check-box [ctrl]="check" [(value)]="checked"></label>
		<div so-list-box [(items)]="items" [(value)]="selected"></div>`,
})
class Host {
	readonly ctrl = new TInput()
	readonly check = new TCheckBox()
	readonly input = viewChild(TInputComponent)
	readonly text = signal('initial')
	readonly label = signal<string | undefined>('Name')
	readonly checked = signal<boolean | undefined>(false)
	readonly selected = signal<TListBoxValue>([])
	items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
	readonly events: TValuePayload<string>[] = []
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

describe('native Angular models', () => {
	it('types model values independently of public change payloads', () => {
		expectTypeOf<TInputComponent['valueChange']>().toEqualTypeOf<EventEmitter<string>>()
		expectTypeOf<TInputComponent['aria_labelChange']>().toEqualTypeOf<
			EventEmitter<string | undefined>
		>()
		expectTypeOf<TCheckBoxComponent['valueChange']>().toEqualTypeOf<
			EventEmitter<boolean | undefined>
		>()
		expectTypeOf<TListBoxComponent['valueChange']>().toEqualTypeOf<
			EventEmitter<TListBoxValue>
		>()
		expectTypeOf<TInputComponent['soChangeValue']>().toEqualTypeOf<
			EventEmitter<TValuePayload<string>>
		>()
	})

	it('round trips a text field, boolean, collection and plugin input through banana bindings', async () => {
		const fixture = TestBed.createComponent(Host)
		fixture.detectChanges()
		await frame()
		const host = fixture.componentInstance
		const element: HTMLElement = fixture.nativeElement
		const field = element.querySelector('input')
		if (!field) throw new Error('Missing input')
		expect(field.value).toBe('initial')
		field.value = 'typed'
		field.dispatchEvent(new Event('input', { bubbles: true }))
		fixture.detectChanges()
		expect(host.text()).toBe('typed')
		expect(host.events.at(-1)).toEqual({ oldValue: 'initial', newValue: 'typed' })
		host.text.set('external')
		host.label.set('Updated name')
		fixture.detectChanges()
		expect(field.value).toBe('external')
		expect(field.getAttribute('aria-label')).toBe('Updated name')
		host.check.value = true
		expect(host.checked()).toBe(true)
		const row = element.querySelectorAll('.so-list-box-item .so-button')[1]
		if (!row) throw new Error('Missing collection row')
		row.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		fixture.detectChanges()
		expect(host.selected()).toBe('b')
	})

	it('emits collection facade input changes through the same model mechanism', () => {
		const fixture = TestBed.createComponent(TListBoxComponent, { inferTagName: true })
		fixture.detectChanges()
		const received: unknown[] = []
		fixture.componentInstance.itemsChange.subscribe((items) => received.push(items))
		const items = [{ value: 'c', text: 'C' }]
		fixture.componentRef.setInput('items', items)
		fixture.detectChanges()
		expect(received).toEqual([[expect.objectContaining({ value: 'c', text: 'C' })]])
	})

	it('emits a plugin model from its trigger without creating unobserved model emitters', () => {
		const fixture = TestBed.createComponent(TInputComponent, { inferTagName: true })
		fixture.detectChanges()
		const input = fixture.componentInstance
		expect(Object.hasOwn(input, 'valueChange')).toBe(false)
		const labels: (string | undefined)[] = []
		input.aria_labelChange.subscribe((value) => labels.push(value))
		fixture.componentRef.setInput('aria_label', 'New label')
		fixture.detectChanges()
		expect(labels).toEqual(['New label'])
		expect(Object.hasOwn(input, 'valueChange')).toBe(false)
	})
})
