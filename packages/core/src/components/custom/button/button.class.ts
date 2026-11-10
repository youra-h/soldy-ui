import type { TEventSink } from '../../../common'
import { TTextable } from '../../base/textable'
import type { IButton, IButtonProps, TButtonView, TButtonEvents } from './types'
import type { TDefaultValues } from '../../base/component'
import { NATIVE_BUTTON_TAGS } from '../../../common'

export default class TButton<
	TProps extends IButtonProps = IButtonProps,
	TEvents extends TButtonEvents = TButtonEvents,
>
	extends TTextable<TProps, TEvents>
	implements IButton<TProps, TEvents>
{
	static override baseClass = 'so-button'

	static defaultValues: typeof TTextable.defaultValues &
		TDefaultValues<IButtonProps, never, 'view'> = {
		...TTextable.defaultValues,
		view: undefined,
		tag: 'button',
	}

	protected _view: TButtonView | undefined

	constructor(props: Partial<TProps> = {}) {
		super(props)

		const ctor = new.target as typeof TButton

		this._applyView(props.view ?? ctor.defaultValues.view)

		this.events.on('change:tag', () => this._syncButtonAria())
		this.events.on('change:disabled', () => this._syncButtonAria())

		this._syncButtonAria()
	}

	protected override get _sink(): TEventSink<TButtonEvents> {
		return this.events
	}

	get view(): TButtonView | undefined {
		return this._view
	}

	/**
	 * Модификатор вида — с префиксом `--view-`: имя значения выбирает тема, и
	 * без префикса оно столкнулось бы с модификатором библиотеки. `swap`
	 * пропускает пустое значение — без вида модификатора нет вовсе.
	 */
	protected _applyView(newValue: TButtonView | undefined, oldValue?: TButtonView) {
		this._classes.swap({
			prefix: '--view-',
			oldValue,
			newValue,
		})

		this._view = newValue
	}

	set view(value: TButtonView | undefined) {
		const oldView = this.view

		if (this._view === value) return

		this._applyView(value, this._view)
		this._sink.emit('change:view', { newValue: value, oldValue: oldView })
	}

	/**
	 * На нативной `<button>` роль и фокусируемость уже есть, добавлять их
	 * нельзя. На любом другом теге кнопка без `role`/`tabindex` для
	 * скринридера не кнопка, а с клавиатуры недостижима — тогда и `press`
	 * из TActionPlugin по Enter/Space никогда не сработает.
	 */
	protected _syncButtonAria(): void {
		const tag = typeof this.tag === 'string' ? this.tag.toLowerCase() : ''

		if (NATIVE_BUTTON_TAGS.has(tag)) {
			this._aria.remove('role')
			this._aria.remove('tabindex')

			return
		}

		this._aria.add('role', 'button')
		this._aria.add('tabindex', this.disabled ? null : '0')
	}

	getProps(): TProps {
		return {
			...super.getProps(),
			view: this._view,
		} as TProps
	}
}
