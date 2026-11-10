import { TChangeEvent } from '../../../common'
import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import type { IBadge, IBadgeProps, TBadgeEvents, TBadgeView } from './types'

/** Noninteractive label, capped counter or dot. Placement belongs to CSS. */
export default class TBadge extends TStylable<IBadgeProps, TBadgeEvents> implements IBadge {
	static override baseClass = 'so-badge'

	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<IBadgeProps, 'value' | 'max' | 'dot', 'view'> = {
		...TStylable.defaultValues,
		tag: 'span',
		value: '',
		max: 99,
		dot: false,
		view: undefined,
	}

	protected _value: string | number
	protected _max: number
	protected _dot: boolean
	protected _view: TBadgeView | undefined

	constructor(props: Partial<IBadgeProps> = {}) {
		super(props)

		const defaults = (new.target as typeof TBadge).defaultValues

		this._value = props.value ?? defaults.value
		this._max = props.max ?? defaults.max
		this._dot = props.dot ?? defaults.dot
		this._view = props.view ?? defaults.view

		this._classes.swap({ prefix: '--view-', newValue: this._view })
		this._dataset.add('dot', this._dot)
	}

	get value(): string | number {
		return this._value
	}

	set value(value: string | number) {
		if (Object.is(value, this._value)) return

		const event = new TChangeEvent(value, this._value)

		this.events.emit('change:value:before', event)

		if (event.defaultPrevented || Object.is(event.value, this._value)) return

		this._value = event.value
		this.events.emit('change:value', { newValue: event.value, oldValue: event.oldValue })
	}

	get max(): number {
		return this._max
	}

	set max(value: number) {
		if (Object.is(value, this._max)) return

		const oldValue = this._max

		this._max = value
		this.events.emit('change:max', { newValue: value, oldValue })
	}

	get dot(): boolean {
		return this._dot
	}

	set dot(value: boolean) {
		if (value === this._dot) return

		const oldValue = this._dot

		this._dot = value
		this._dataset.add('dot', value)
		this.events.emit('change:dot', { newValue: value, oldValue })
	}

	get view(): TBadgeView | undefined {
		return this._view
	}

	set view(value: TBadgeView | undefined) {
		if (value === this._view) return

		const oldValue = this._view

		this._classes.swap({ prefix: '--view-', oldValue, newValue: value })
		this._view = value
		this.events.emit('change:view', { newValue: value, oldValue })
	}

	get displayValue(): string {
		if (this._dot) return ''
		if (typeof this._value === 'string') return this._value
		if (!Number.isFinite(this._value)) return ''

		const max = Number.isFinite(this._max) && this._max >= 0 ? this._max : 99

		return this._value > max ? String(max) + '+' : String(this._value)
	}

	override getProps(): IBadgeProps {
		return {
			...super.getProps(),
			value: this._value,
			max: this._max,
			dot: this._dot,
			view: this._view,
		}
	}
}
