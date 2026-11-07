import { describe, it, expect } from 'vitest'
import { Component, signal, ɵgetDirectiveDef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, NgModel } from '@angular/forms'
import * as core from '@soldy-ui/core'
import * as angular from '@soldy-ui/angular'
import { exportedDeclarations } from './declarations'
import { ValueAccessorDirective } from '../src/adapter/runtime/value-accessor.directive'

function blurControl(root: HTMLElement): void {
	const target = root.querySelector('input, textarea, [role=listbox]') ?? root
	target.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
class ReactiveHost {
	readonly control = new FormControl<unknown>(null)
}
class ModelHost {
	readonly value = signal<unknown>(null)
}

@Component({
	selector: 'probe-input-reactive',
	imports: [ReactiveFormsModule, angular.TInputComponent],
	template: '<div so-input [ctrl]="ctrl" [formControl]="control"></div>',
})
class InputReactive extends ReactiveHost {
	readonly ctrl = new core.TInput()
}

@Component({
	selector: 'probe-input-model',
	imports: [FormsModule, angular.TInputComponent],
	template: '<div so-input [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class InputModel extends ModelHost {
	readonly ctrl = new core.TInput()
}

@Component({
	selector: 'probe-textarea-reactive',
	imports: [ReactiveFormsModule, angular.TTextareaComponent],
	template: '<div so-textarea [ctrl]="ctrl" [formControl]="control"></div>',
})
class TextareaReactive extends ReactiveHost {
	readonly ctrl = new core.TTextarea()
}

@Component({
	selector: 'probe-textarea-model',
	imports: [FormsModule, angular.TTextareaComponent],
	template: '<div so-textarea [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class TextareaModel extends ModelHost {
	readonly ctrl = new core.TTextarea()
}

@Component({
	selector: 'probe-number-input-reactive',
	imports: [ReactiveFormsModule, angular.TNumberInputComponent],
	template: '<div so-number-input [ctrl]="ctrl" [formControl]="control"></div>',
})
class NumberInputReactive extends ReactiveHost {
	readonly ctrl = new core.TNumberInput()
}

@Component({
	selector: 'probe-number-input-model',
	imports: [FormsModule, angular.TNumberInputComponent],
	template: '<div so-number-input [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class NumberInputModel extends ModelHost {
	readonly ctrl = new core.TNumberInput()
}

@Component({
	selector: 'probe-check-box-reactive',
	imports: [ReactiveFormsModule, angular.TCheckBoxComponent],
	template: '<div so-check-box [ctrl]="ctrl" [formControl]="control"></div>',
})
class CheckBoxReactive extends ReactiveHost {
	readonly ctrl = new core.TCheckBox()
}

@Component({
	selector: 'probe-check-box-model',
	imports: [FormsModule, angular.TCheckBoxComponent],
	template: '<div so-check-box [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class CheckBoxModel extends ModelHost {
	readonly ctrl = new core.TCheckBox()
}

@Component({
	selector: 'probe-switch-reactive',
	imports: [ReactiveFormsModule, angular.TSwitchComponent],
	template: '<div so-switch [ctrl]="ctrl" [formControl]="control"></div>',
})
class SwitchReactive extends ReactiveHost {
	readonly ctrl = new core.TSwitch()
}

@Component({
	selector: 'probe-switch-model',
	imports: [FormsModule, angular.TSwitchComponent],
	template: '<div so-switch [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class SwitchModel extends ModelHost {
	readonly ctrl = new core.TSwitch()
}

@Component({
	selector: 'probe-slider-reactive',
	imports: [ReactiveFormsModule, angular.TSliderComponent],
	template: '<div so-slider [ctrl]="ctrl" [formControl]="control"></div>',
})
class SliderReactive extends ReactiveHost {
	readonly ctrl = new core.TSlider()
}

@Component({
	selector: 'probe-slider-model',
	imports: [FormsModule, angular.TSliderComponent],
	template: '<div so-slider [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class SliderModel extends ModelHost {
	readonly ctrl = new core.TSlider()
}

@Component({
	selector: 'probe-rating-reactive',
	imports: [ReactiveFormsModule, angular.TRatingComponent],
	template: '<div so-rating [ctrl]="ctrl" [formControl]="control"></div>',
})
class RatingReactive extends ReactiveHost {
	readonly ctrl = new core.TRating()
}

@Component({
	selector: 'probe-rating-model',
	imports: [FormsModule, angular.TRatingComponent],
	template: '<div so-rating [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class RatingModel extends ModelHost {
	readonly ctrl = new core.TRating()
}

@Component({
	selector: 'probe-radio-group-reactive',
	imports: [ReactiveFormsModule, angular.TRadioGroupComponent],
	template: '<div so-radio-group [ctrl]="ctrl" [formControl]="control" [items]="items"></div>',
})
class RadioGroupReactive extends ReactiveHost {
	readonly ctrl = new core.TRadioGroup()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-radio-group-model',
	imports: [FormsModule, angular.TRadioGroupComponent],
	template: '<div so-radio-group [ctrl]="ctrl" [(ngModel)]="value" [items]="items"></div>',
})
class RadioGroupModel extends ModelHost {
	readonly ctrl = new core.TRadioGroup()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-select-reactive',
	imports: [ReactiveFormsModule, angular.TSelectComponent],
	template: '<div so-select [ctrl]="ctrl" [formControl]="control" [items]="items"></div>',
})
class SelectReactive extends ReactiveHost {
	readonly ctrl = new core.TSelect()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-select-model',
	imports: [FormsModule, angular.TSelectComponent],
	template: '<div so-select [ctrl]="ctrl" [(ngModel)]="value" [items]="items"></div>',
})
class SelectModel extends ModelHost {
	readonly ctrl = new core.TSelect()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-list-box-reactive',
	imports: [ReactiveFormsModule, angular.TListBoxComponent],
	template: '<div so-list-box [ctrl]="ctrl" [formControl]="control" [items]="items"></div>',
})
class ListBoxReactive extends ReactiveHost {
	readonly ctrl = new core.TListBox()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-list-box-model',
	imports: [FormsModule, angular.TListBoxComponent],
	template: '<div so-list-box [ctrl]="ctrl" [(ngModel)]="value" [items]="items"></div>',
})
class ListBoxModel extends ModelHost {
	readonly ctrl = new core.TListBox()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-tags-reactive',
	imports: [ReactiveFormsModule, angular.TTagsComponent],
	template: '<div so-tags [ctrl]="ctrl" [formControl]="control" [items]="items"></div>',
})
class TagsReactive extends ReactiveHost {
	readonly ctrl = new core.TTags()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-tags-model',
	imports: [FormsModule, angular.TTagsComponent],
	template: '<div so-tags [ctrl]="ctrl" [(ngModel)]="value" [items]="items"></div>',
})
class TagsModel extends ModelHost {
	readonly ctrl = new core.TTags()
	readonly items = [
		{ value: 'a', text: 'A' },
		{ value: 'b', text: 'B' },
	]
}

@Component({
	selector: 'probe-calendar-reactive',
	imports: [ReactiveFormsModule, angular.TCalendarComponent],
	template: '<div so-calendar [ctrl]="ctrl" [formControl]="control"></div>',
})
class CalendarReactive extends ReactiveHost {
	readonly ctrl = new core.TCalendar()
}

@Component({
	selector: 'probe-calendar-model',
	imports: [FormsModule, angular.TCalendarComponent],
	template: '<div so-calendar [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class CalendarModel extends ModelHost {
	readonly ctrl = new core.TCalendar()
}

@Component({
	selector: 'probe-date-input-reactive',
	imports: [ReactiveFormsModule, angular.TDateInputComponent],
	template: '<div so-date-input [ctrl]="ctrl" [formControl]="control"></div>',
})
class DateInputReactive extends ReactiveHost {
	readonly ctrl = new core.TDateInput()
}

@Component({
	selector: 'probe-date-input-model',
	imports: [FormsModule, angular.TDateInputComponent],
	template: '<div so-date-input [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class DateInputModel extends ModelHost {
	readonly ctrl = new core.TDateInput()
}

@Component({
	selector: 'probe-date-picker-reactive',
	imports: [ReactiveFormsModule, angular.TDatePickerComponent],
	template: '<div so-date-picker [ctrl]="ctrl" [formControl]="control"></div>',
})
class DatePickerReactive extends ReactiveHost {
	readonly ctrl = new core.TDatePicker()
}

@Component({
	selector: 'probe-date-picker-model',
	imports: [FormsModule, angular.TDatePickerComponent],
	template: '<div so-date-picker [ctrl]="ctrl" [(ngModel)]="value"></div>',
})
class DatePickerModel extends ModelHost {
	readonly ctrl = new core.TDatePicker()
}

const cases = [
	{
		name: 'Input',
		reactive: InputReactive,
		model: InputModel,
		first: 'initial',
		next: 'changed',
		reset: undefined,
	},
	{
		name: 'Textarea',
		reactive: TextareaReactive,
		model: TextareaModel,
		first: 'initial',
		next: 'changed',
		reset: '',
	},
	{
		name: 'NumberInput',
		reactive: NumberInputReactive,
		model: NumberInputModel,
		first: 2,
		next: 3,
		reset: undefined,
	},
	{
		name: 'CheckBox',
		reactive: CheckBoxReactive,
		model: CheckBoxModel,
		first: false,
		next: true,
		reset: false,
	},
	{
		name: 'Switch',
		reactive: SwitchReactive,
		model: SwitchModel,
		first: false,
		next: true,
		reset: false,
	},
	{ name: 'Slider', reactive: SliderReactive, model: SliderModel, first: 2, next: 3, reset: 0 },
	{ name: 'Rating', reactive: RatingReactive, model: RatingModel, first: 2, next: 3, reset: 0 },
	{
		name: 'RadioGroup',
		reactive: RadioGroupReactive,
		model: RadioGroupModel,
		first: 'a',
		next: 'b',
		reset: undefined,
	},
	{
		name: 'Select',
		reactive: SelectReactive,
		model: SelectModel,
		first: 'a',
		next: 'b',
		reset: undefined,
	},
	{
		name: 'ListBox',
		reactive: ListBoxReactive,
		model: ListBoxModel,
		first: 'a',
		next: 'b',
		reset: undefined,
	},
	{
		name: 'Tags',
		reactive: TagsReactive,
		model: TagsModel,
		first: 'a',
		next: 'b',
		reset: undefined,
	},
	{
		name: 'Calendar',
		reactive: CalendarReactive,
		model: CalendarModel,
		first: '2026-11-07',
		next: '2026-11-08',
		reset: undefined,
	},
	{
		name: 'DateInput',
		reactive: DateInputReactive,
		model: DateInputModel,
		first: '2026-11-07',
		next: '2026-11-08',
		reset: undefined,
	},
	{
		name: 'DatePicker',
		reactive: DatePickerReactive,
		model: DatePickerModel,
		first: '2026-11-07',
		next: '2026-11-08',
		reset: undefined,
	},
] as const

describe('Angular Forms', () => {
	it.each(cases)(
		'$name: reactive write, change, disabled, touched and reset',
		async ({ reactive, first, next, reset }) => {
			const fixture = TestBed.createComponent<ReactiveHost & { ctrl: object }>(reactive)
			const host = fixture.componentInstance
			host.control.setValue(first)
			fixture.detectChanges()
			await frame()
			expect(Reflect.get(host.ctrl, 'value')).toEqual(first)
			const changes: unknown[] = []
			host.control.valueChanges.subscribe((value) => changes.push(value))
			host.control.setValue(next)
			expect(changes).toEqual([next])
			expect(Reflect.get(host.ctrl, 'value')).toEqual(next)
			host.control.setValue(first, { emitEvent: false })
			expect(changes).toEqual([next])
			Reflect.set(host.ctrl, 'value', next)
			expect(host.control.value).toEqual(next)
			expect(host.control.dirty).toBe(true)
			host.control.disable()
			expect(Reflect.get(host.ctrl, 'disabled')).toBe(true)
			host.control.enable()
			expect(Reflect.get(host.ctrl, 'disabled')).toBe(false)
			expect(host.control.touched).toBe(false)
			blurControl(
				fixture.debugElement.query(By.directive(ValueAccessorDirective)).nativeElement,
			)
			expect(host.control.touched).toBe(true)
			host.control.reset()
			expect(host.control.value).toBeNull()
			expect(Reflect.get(host.ctrl, 'value')).toEqual(reset)
			expect(host.control.pristine).toBe(true)
			expect(host.control.untouched).toBe(true)
		},
	)

	it.each(cases)(
		'$name: ngModel writes, receives changes and resets',
		async ({ model, first, next, reset }) => {
			const fixture = TestBed.createComponent<ModelHost & { ctrl: object }>(model)
			const host = fixture.componentInstance
			host.value.set(first)
			fixture.detectChanges()
			await fixture.whenStable()
			await frame()
			expect(Reflect.get(host.ctrl, 'value')).toEqual(first)
			host.value.set(next)
			fixture.detectChanges()
			await fixture.whenStable()
			expect(Reflect.get(host.ctrl, 'value')).toEqual(next)
			Reflect.set(host.ctrl, 'value', first)
			expect(host.value()).toEqual(first)
			const form = fixture.debugElement
				.query(By.directive(NgModel))
				.injector.get(NgModel).control
			form.disable()
			expect(Reflect.get(host.ctrl, 'disabled')).toBe(true)
			form.enable()
			expect(Reflect.get(host.ctrl, 'disabled')).toBe(false)
			blurControl(
				fixture.debugElement.query(By.directive(ValueAccessorDirective)).nativeElement,
			)
			expect(form.touched).toBe(true)
			form.reset()
			expect(host.value()).toBeNull()
			expect(Reflect.get(host.ctrl, 'value')).toEqual(reset)
		},
	)

	it('provides an accessor on every exported component with a writable value model', () => {
		const declarations = exportedDeclarations().filter((d) => d.soldy)
		expect(declarations.length).toBeGreaterThan(50)
		for (const declaration of declarations) {
			const definition = ɵgetDirectiveDef(declaration.type)
			const forms =
				definition?.hostDirectives?.some(
					(entry) =>
						typeof entry !== 'function' && entry.directive === ValueAccessorDirective,
				) ?? false
			expect(forms, declaration.name).toBe(declaration.outputs.includes('valueChange'))
		}
	})
})

@Component({
	selector: 'probe-form-group',
	imports: [ReactiveFormsModule, angular.TInputComponent],
	template: '<form [formGroup]="form"><div so-input formControlName="name"></div></form>',
})
class GroupHost {
	readonly form = new FormGroup({
		name: new FormControl('initial', { nonNullable: true, updateOn: 'blur' }),
	})
}

describe('form lifecycle', () => {
	it('supports formControlName, updateOn blur, internal focus moves and non-nullable reset', async () => {
		const fixture = TestBed.createComponent(GroupHost)
		fixture.detectChanges()
		await frame()
		const host = fixture.componentInstance
		const root: HTMLElement = fixture.nativeElement
		const field = root.querySelector('input')
		if (!field) throw new Error('Missing input')
		expect(field.value).toBe('initial')
		field.value = 'typed'
		field.dispatchEvent(new Event('input', { bubbles: true }))
		expect(host.form.controls.name.value).toBe('initial')
		field.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: field }))
		expect(host.form.controls.name.untouched).toBe(true)
		field.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
		expect(host.form.controls.name.value).toBe('typed')
		expect(host.form.controls.name.touched).toBe(true)
		fixture.detectChanges()
		host.form.reset()
		fixture.detectChanges()
		await fixture.whenStable()
		expect(field.value).toBe('initial')
		expect(host.form.controls.name.pristine).toBe(true)
	})
})

describe('initial form writes', () => {
	it('clears an existing ctrl value when the initial form value is null', () => {
		const fixture = TestBed.createComponent(InputReactive)
		fixture.componentInstance.ctrl.value = 'stale'
		fixture.detectChanges()
		expect(fixture.componentInstance.ctrl.value).toBeUndefined()
		expect(fixture.componentInstance.control.value).toBeNull()
	})
})

@Component({
	selector: 'probe-submit-form',
	imports: [ReactiveFormsModule, angular.TInputComponent],
	template: '<form [formGroup]="form"><div so-input formControlName="name"></div></form>',
})
class SubmitHost {
	readonly form = new FormGroup({
		name: new FormControl('initial', { nonNullable: true, updateOn: 'submit' }),
	})
}

describe('forms lifecycle boundaries', () => {
	it('honors updateOn submit', async () => {
		const fixture = TestBed.createComponent(SubmitHost)
		fixture.detectChanges()
		await frame()
		const root: HTMLElement = fixture.nativeElement
		const field = root.querySelector('input')
		const form = root.querySelector('form')
		if (!field || !form) throw new Error('Missing form field')
		field.value = 'submitted'
		field.dispatchEvent(new Event('input', { bubbles: true }))
		expect(fixture.componentInstance.form.value.name).toBe('initial')
		form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
		expect(fixture.componentInstance.form.value.name).toBe('submitted')
	})

	it('applies initial disabled state and stops updates after removal', () => {
		const fixture = TestBed.createComponent(InputReactive)
		const host = fixture.componentInstance
		host.control.reset({ value: 'disabled', disabled: true })
		fixture.detectChanges()
		expect(host.ctrl.disabled).toBe(true)
		expect(host.ctrl.value).toBe('disabled')
		fixture.destroy()
		host.ctrl.value = 'removed'
		expect(host.control.value).toBe('disabled')
	})
})
