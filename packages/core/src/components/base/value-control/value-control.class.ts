import { TControl } from '../control'
import type { TDefaultValues } from '../component'
import type { IValueControlProps, TValueControlEvents } from './types'
import { TChangeEvent } from '../../../common'
import { sameValue } from '../../../common/utility/same-value'
import type { TValuePayload, TEventSink } from '../../../common'

/** Base for value controls with name and invalid state; inherits interaction and styling. */
export default class TValueControl<
	TValue,
	TProps extends IValueControlProps<TValue> = IValueControlProps<TValue>,
	TEvents extends TValueControlEvents<TValue> = TValueControlEvents<TValue>,
> extends TControl<TProps, TEvents> {
	static defaultValues: typeof TControl.defaultValues &
		TDefaultValues<IValueControlProps<any>, 'name', 'value'> = {
		...TControl.defaultValues,
		name: '',
		value: undefined,
	}

	protected _name: string
	protected _value: TValue
	/** Своё `invalid` — то, что записали. Итог считает геттер. */
	protected _invalid = false

	constructor(props: Partial<TProps> = {}) {
		super(props)

		const ctor = new.target as typeof TValueControl

		this._name = props.name ?? ctor.defaultValues.name

		this._value = props.value ?? (ctor.defaultValues.value as TValue)
	}

	/**
	 * Эмит собственных событий класса — без приведения `this.events` к
	 * конкретной карте (см. `TEventSink` в `common/event/types.ts`).
	 */
	protected get _sink(): TEventSink<TValueControlEvents<TValue>> {
		return this.events
	}

	get name(): string {
		return this._name
	}
	set name(value: string) {
		const oldValue = this._name
		if (oldValue === value) return
		this._name = value
		this._sink.emit('change:name', { newValue: value, oldValue })
	}

	get value(): TValue {
		return this._value
	}
	/**
	 * Пишет своё значение. Список сверяется поэлементно (`sameValue`): эхо
	 * модели тем же списком — не смена.
	 */
	set value(value: TValue) {
		if (sameValue(value, this._value)) return

		const e = new TChangeEvent(value, this._value)

		this._sink.emit('change:value:before', e)

		if (e.defaultPrevented || sameValue(e.value, this._value)) return

		const before = this.value

		this._value = e.value
		this._valueChanged(before)
	}

	/** Emits effective value changes, including derived constraint changes. */
	protected _valueChanged(oldValue: TValue): void {
		const newValue = this.value
		if (sameValue(newValue, oldValue)) return

		const payload: TValuePayload<TValue> = { newValue, oldValue }

		this._sink.emit('change:value', payload)
	}

	/**
	 * Значение не прошло проверку: ошибку видят тема (`data-invalid`) и
	 * скринридер (`aria-invalid` на элементе с `aria`).
	 *
	 * Свойство инстанса, а не проп: что неверно и когда это показывать, решает
	 * приложение, а в разметке ошибку задают полю формы `Field` — он и пишет её
	 * своему контролу. Без разметки её задаёт код. Своей проверки у базы нет;
	 * наследник, который проверяет значение сам (поле даты — границы), считает
	 * итог геттером: своё или своя ошибка.
	 *
	 * Атрибуты стоят только у невалидного: при `false` их нет, и у контролов
	 * вне формы — строк списков, табов, тегов — не появляется лишнего
	 * `data-invalid="false"`.
	 */
	get invalid(): boolean {
		return this._invalid
	}

	set invalid(value: boolean) {
		const oldValue = this._invalid
		if (oldValue === value) return
		this._invalid = value
		this._invalidChanged(oldValue)
	}

	/**
	 * Итог `invalid` мог смениться — атрибуты и `change:invalid`, если
	 * сменился. Наследник, чей итог зависит не только от своего значения, зовёт
	 * это и при смене той зависимости.
	 */
	protected _invalidChanged(before: boolean): void {
		const invalid = this.invalid
		if (invalid === before) return
		this._syncInvalid()
		this._sink.emit('change:invalid', { newValue: invalid, oldValue: before })
	}

	/** Атрибуты ошибки по итогу: только при `true`, `null` их снимает. */
	protected _syncInvalid(): void {
		const invalid = this.invalid

		this._dataset.add('invalid', invalid || null)
		this._aria.add('aria-invalid', invalid ? 'true' : null)
	}

	getProps(): TProps {
		return {
			...super.getProps(),
			name: this._name,
			value: this.value,
		} as TProps
	}
}
