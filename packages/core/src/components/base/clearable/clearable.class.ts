import { TInputControl } from '../input-control'
import type { TDefaultValues } from '../component'
import { TAria } from '../../../common'
import type { TEventSink } from '../../../common'
import type { IClearable, IClearableProps, TClearableEvents } from './types'

/**
 * Shared clear action for Input, NumberInput, DateInput and DatePicker.
 *
 * The field owns its clear button. Select forwards clearable to its field rather
 * than rendering another button. This base owns data-clearable, clearAria and clear;
 * it has no baseClass because the concrete field supplies the CSS block. TField
 * is the separate form wrapper with a label, helper and error.
 *
 * Clearing first calls _clearValue for the field's value shape, then emits clear
 * even for an empty field: a multiple Select can have an empty input and selected
 * tags. The built-in button and a custom clear slot use the same action.
 *
 * There is no readonly or disabled guard on the command. Disabled fields disable
 * the button; readonly fields can still clear, as select-only Select requires.
 * Application code may call clear directly. The descriptor does not publish clear:
 * it is an instance API, like ListBox.choose.
 */
export default class TClearable<
	TValue = string,
	TProps extends IClearableProps<TValue> = IClearableProps<TValue>,
	TEvents extends TClearableEvents<TValue> = TClearableEvents<TValue>,
>
	extends TInputControl<TValue, TProps, TEvents>
	implements IClearable<TValue, TProps, TEvents>
{
	static defaultValues: typeof TInputControl.defaultValues &
		TDefaultValues<IClearableProps<any>, 'clearable'> = {
		...TInputControl.defaultValues,
		clearable: false,
	}

	protected _clearable!: boolean
	protected _clearAria: TAria

	constructor(props: Partial<TProps> = {}) {
		super(props)

		const ctor = new.target as typeof TClearable

		this._applyClearable(props.clearable ?? ctor.defaultValues.clearable)

		this._clearAria = new TAria()
		this._clearAria.subscribe((_set, oldValue) =>
			this._sink.emit('change:clearAria', { newValue: this._clearAria.toObject(), oldValue }),
		)
	}

	/**
	 * Эмит собственных событий класса — без приведения `this.events` к
	 * конкретной карте (см. `TEventSink` в `common/event/types.ts`).
	 */
	protected override get _sink(): TEventSink<TClearableEvents<TValue>> {
		return this.events
	}

	get clearable(): boolean {
		return this._clearable
	}

	set clearable(value: boolean) {
		const oldClearable = this.clearable

		if (this._clearable === value) return

		this._applyClearable(value)
		this._sink.emit('change:clearable', { newValue: value, oldValue: oldClearable })
	}

	/**
	 * Набор кнопки очистки. Имя в нём — вместе с именем поля: «Clear Город».
	 *
	 * Без имени поля на форме с пятью полями в списке элементов скринридера
	 * будет пять одинаковых «Clear, кнопка», и выбрать нужную нельзя. Та же
	 * причина, по которой у таба имя кнопки закрытия собирается с его текстом.
	 * Имя пишет плагин имён формы (`TClearableNamesPlugin`, у DatePicker — его
	 * наследник) по шаблону локали — и на смену имени поля; об изменении набор
	 * сообщает `change:clearAria`.
	 *
	 * Отдельный набор, а не часть `aria`: `aria` описывает само поле, а это —
	 * соседняя кнопка. Один элемент — один набор.
	 */
	get clearAria(): TAria {
		return this._clearAria
	}

	/**
	 * Очистить поле: шаг формы, потом событие `clear`.
	 *
	 * Поле, привязанное к инстансу, а не метод прототипа: разметка отдаёт его в
	 * scope слота `clear` без инстанса, и своя кнопка зовёт его голой функцией.
	 * Метод потерял бы там `this`. Привязка здесь одна на все адаптеры —
	 * обёртку в шаблоне пришлось бы повторить в каждом.
	 */
	readonly clear = (): void => {
		this._clearValue()
		this._sink.emit('clear')
	}

	/**
	 * Шаг очистки формы — как пустеет её значение. База ни во что конкретное не
	 * рендерится и значения не знает, поэтому по умолчанию ничего не делает.
	 */
	protected _clearValue(): void {}

	protected _applyClearable(value: boolean): void {
		this._clearable = value
		this._dataset.add('clearable', value)
	}

	override getProps(): TProps {
		return {
			...super.getProps(),
			clearable: this._clearable,
		}
	}
}
