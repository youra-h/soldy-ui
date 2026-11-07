import { describe, expect, it } from 'vitest'
import {
	TInput,
	TNumberInput,
	TDateInput,
	TDatePicker,
	TTextarea,
	TCheckBox,
	TSwitch,
	TRating,
	TSelect,
	TTabs,
	TSlider,
	TProgressLinear,
	TTabsItem,
	TTagsItem,
} from '@soldy-ui/core'

describe('CSS state contract', () => {
	it.each([
		['Input', () => new TInput()],
		['NumberInput', () => new TNumberInput()],
		['DateInput', () => new TDateInput()],
		['DatePicker', () => new TDatePicker()],
		['Textarea', () => new TTextarea()],
		['CheckBox', () => new TCheckBox()],
		['Switch', () => new TSwitch()],
		['Rating', () => new TRating()],
		['Select', () => new TSelect()],
	] as const)(
		'%s publishes readonly and required on initial render and every toggle',
		(_name, create) => {
			const target = create()

			for (const value of [false, true, false, true]) {
				target.readonly = value
				target.required = value
				expect(target.dataset.toObject()).toMatchObject({
					'data-readonly': String(value),
					'data-required': String(value),
				})
				expect(
					target.classes.toArray().some((name) => /--(readonly|required)$/.test(name)),
				).toBe(false)
			}
		},
	)

	it.each([
		['Input', () => new TInput({ clearable: true })],
		['NumberInput', () => new TNumberInput({ clearable: true })],
		['DateInput', () => new TDateInput({ clearable: true })],
		['DatePicker', () => new TDatePicker({ clearable: true })],
	] as const)('%s publishes clearable without a parallel state class', (_name, create) => {
		const target = create()
		for (const value of [true, false, true]) {
			target.clearable = value
			expect(target.dataset.toObject()['data-clearable']).toBe(String(value))
			expect(target.classes.toArray().some((name) => name.endsWith('--clearable'))).toBe(
				false,
			)
		}
	})

	it('Select has one styling channel for open and editable state', () => {
		const target = new TSelect({ open: true, editable: true })
		for (const value of [true, false, true]) {
			target.open = value
			target.editable = value

			expect(target.dataset.toObject()).toMatchObject({
				'data-open': String(value),
				'data-editable': String(value),
			})
			expect(target.classes.toArray().some((name) => /--(open|editable)$/.test(name))).toBe(
				false,
			)
		}
	})

	it('CheckBox publishes and resets its mixed state', () => {
		const target = new TCheckBox({ indeterminate: true })
		expect(target.dataset.toObject()['data-indeterminate']).toBe('true')
		target.indeterminate = false
		expect(target.dataset.toObject()['data-indeterminate']).toBe('false')
		expect(target.classes.toArray()).not.toContain('so-check-box--indeterminate')
	})

	it.each([
		['Tabs item', () => new TTabsItem({ closable: true })],
		['Tags item', () => new TTagsItem({ closable: true })],
	] as const)('%s keeps its own closable flag in dataset', (_name, create) => {
		const target = create()
		for (const value of [true, false, true]) {
			target.closable = value
			expect(target.dataset.toObject()['data-closable']).toBe(String(value))
			expect(target.classes.toArray().some((name) => name.endsWith('--closable'))).toBe(false)
		}
	})

	it.each([
		['Tabs', () => new TTabs()],
		['Slider', () => new TSlider()],
		['ProgressLinear', () => new TProgressLinear()],
	] as const)(
		'%s replaces the orientation modifier without retaining the previous value',
		(_name, create) => {
			const target = create()

			for (const value of ['horizontal', 'vertical', 'horizontal'] as const) {
				target.orientation = value
				expect(
					target.classes.toArray().filter((name) => /--orientation-/.test(name)),
				).toHaveLength(1)
				expect(
					target.classes
						.toArray()
						.some((name) => name.endsWith('--orientation-' + value)),
				).toBe(true)
				expect(
					target.classes.toArray().some((name) => /--(horizontal|vertical)$/.test(name)),
				).toBe(false)
			}
		},
	)

	it('Tabs namespaces alignment and removes the modifier when returning to start', () => {
		const target = new TTabs()
		for (const value of ['start', 'center', 'end', 'stretch', 'start'] as const) {
			target.alignment = value
			expect(
				target.classes.toArray().filter((name) => name.includes('--alignment-')),
			).toEqual(value === 'start' ? [] : ['so-tabs--alignment-' + value])
			expect(
				target.classes.toArray().some((name) => /--(center|end|stretch)$/.test(name)),
			).toBe(false)
		}
	})
})
