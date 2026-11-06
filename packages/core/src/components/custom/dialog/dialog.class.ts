import { TModalLayer } from '../../base/modal-layer'
import type { TDefaultValues } from '../../base/component'
import { TAria } from '../../../common'
import type { IDialog, IDialogProps, TDialogEvents, TDialogPlacement } from './types'

/**
 * Модальное окно.
 *
 * Паттерн APG — Dialog (Modal). Всё, что следует из модальности, — роль,
 * `aria-modal`, имя от заголовка, кнопка закрытия, запрос закрытия с
 * отменяемым `close:before`, `dismissible` и размер — у общей с выезжающей
 * панелью базы `TModalLayer`. Своего у окна три вещи: место на экране,
 * разворот и режим предупреждения.
 *
 * **Предупреждение** (`alert`) — вариант того же окна, а не отдельный
 * компонент: клавиатура и фокус у него те же. Меняется роль —
 * `alertdialog`, — и описанием окна становится тело: `id` тела и ссылку
 * `aria-describedby` на него пишет плагин `TDialogIdsPlugin`.
 *
 * **Место, размер и разворот — значения, раскладка — тема.** Место уходит
 * модификатором `--placement-<v>` (стоит всегда, и у центра), развёрнутость —
 * `data-maximized`, ширина, высота и отступ от краёв экрана — переменными
 * раскладки (`TDialogLayoutPlugin`). Координат и замеров у окна нет.
 */
export default class TDialog extends TModalLayer<IDialogProps, TDialogEvents> implements IDialog {
	static override baseClass = 'so-dialog'

	static defaultValues: typeof TModalLayer.defaultValues &
		TDefaultValues<
			IDialogProps,
			'placement' | 'maximized' | 'maximizable' | 'alert',
			'offset'
		> = {
		...TModalLayer.defaultValues,
		placement: 'center',
		// Не задан — отступ темы. Не `0`: ноль — это «вплотную к краям»
		offset: undefined,
		maximized: false,
		maximizable: false,
		alert: false,
	}

	protected _placement!: TDialogPlacement
	protected _offset: number | string | undefined
	protected _maximized!: boolean
	protected _maximizable: boolean
	protected _alert!: boolean
	protected _bodyAria: TAria
	protected _maximizeAria: TAria

	constructor(props: Partial<IDialogProps> = {}) {
		super(props)

		const ctor = new.target as typeof TDialog

		this._bodyAria = new TAria()
		this._bodyAria.subscribe((_set, oldValue) =>
			this.events.emit('change:bodyAria', { newValue: this._bodyAria.toObject(), oldValue }),
		)

		this._maximizeAria = new TAria()
		this._maximizeAria.subscribe((_set, oldValue) =>
			this.events.emit('change:maximizeAria', {
				newValue: this._maximizeAria.toObject(),
				oldValue,
			}),
		)

		this._offset = props.offset ?? ctor.defaultValues.offset
		this._maximizable = props.maximizable ?? ctor.defaultValues.maximizable

		this._applyAlert(props.alert ?? ctor.defaultValues.alert)
		this._applyPlacement(props.placement ?? ctor.defaultValues.placement)
		this._applyMaximized(props.maximized ?? ctor.defaultValues.maximized)
	}

	/** Развернуть окно или вернуть ему размер — действие кнопки разворота. */
	toggleMaximized(): void {
		this.maximized = !this._maximized
	}

	/** Где окно стоит на экране: по центру или у одной из сторон. */
	get placement(): TDialogPlacement {
		return this._placement
	}

	set placement(value: TDialogPlacement) {
		const oldPlacement = this.placement

		if (this._placement === value) return

		this._applyPlacement(value, this._placement)
		this.events.emit('change:placement', { newValue: value, oldValue: oldPlacement })
	}

	/**
	 * Отступ окна от краёв экрана: число — px, строка — CSS-значение. Не задан
	 * — отступ темы, `0` — вплотную. Один на все стороны: у центра он
	 * действует со всех, у стороны — от её края, и со всех — как потолок
	 * размера. Стороны по отдельности правит подписчик `layout:offset:before`
	 * — событие раскладки, а не ядра: значение уходит теме переменными.
	 */
	get offset(): number | string | undefined {
		return this._offset
	}

	set offset(value: number | string | undefined) {
		const oldOffset = this.offset

		if (this._offset === value) return

		this._offset = value
		this.events.emit('change:offset', { newValue: value, oldValue: oldOffset })
	}

	/**
	 * Развёрнуто ли окно на весь экран. Пишут и разработчик, и кнопка
	 * разворота: состояние одно, иначе кнопка разошлась бы с тем, что видно.
	 */
	get maximized(): boolean {
		return this._maximized
	}

	set maximized(value: boolean) {
		const oldMaximized = this.maximized

		if (this._maximized === value) return

		this._applyMaximized(value)
		this.events.emit('change:maximized', { newValue: value, oldValue: oldMaximized })
	}

	/** Показывать ли кнопку разворота. Развернуть окно можно и без неё — `maximized`. */
	get maximizable(): boolean {
		return this._maximizable
	}

	set maximizable(value: boolean) {
		const oldMaximizable = this.maximizable

		if (this._maximizable === value) return

		this._maximizable = value
		this.events.emit('change:maximizable', { newValue: value, oldValue: oldMaximizable })
	}

	/** Окно — предупреждение: `role="alertdialog"`, описание — тело окна. */
	get alert(): boolean {
		return this._alert
	}

	set alert(value: boolean) {
		const oldAlert = this.alert

		if (this._alert === value) return

		this._applyAlert(value)
		this.events.emit('change:alert', { newValue: value, oldValue: oldAlert })
	}

	/**
	 * Сторона тела: на него ссылается `aria-describedby` предупреждения.
	 * Живой набор: `id` в него пишет `TDialogIdsPlugin`, об изменении набор
	 * сообщает `change:bodyAria`.
	 */
	get bodyAria(): TAria {
		return this._bodyAria
	}

	/**
	 * Набор кнопки разворота: её имя и состояние — нажата, когда окно
	 * развёрнуто. Имя одно на оба состояния: кнопка — переключатель, и
	 * состояние она сообщает `aria-pressed`, а не сменой имени (APG, Button).
	 * Живой: состояние пишет окно, имя от локали — плагин имён
	 * (`TDialogNamesPlugin`), об изменении набор сообщает `change:maximizeAria`.
	 */
	get maximizeAria(): TAria {
		return this._maximizeAria
	}

	protected _applyAlert(value: boolean): void {
		this._alert = value

		this._aria.add('role', value ? 'alertdialog' : 'dialog')
	}

	protected _applyPlacement(newValue: TDialogPlacement, oldValue?: TDialogPlacement): void {
		this._classes.swap({
			prefix: '--placement-',
			oldValue,
			newValue,
		})

		this._placement = newValue
	}

	protected _applyMaximized(value: boolean): void {
		this._maximized = value

		// Тема по нему разворачивает окно, а место и размер перестают действовать
		this._dataset.add('maximized', value)
		this._maximizeAria.add('aria-pressed', value ? 'true' : 'false')
	}

	override getProps(): IDialogProps {
		return {
			...super.getProps(),
			placement: this._placement,
			offset: this._offset,
			maximized: this._maximized,
			maximizable: this._maximizable,
			alert: this._alert,
		}
	}
}
