import { TValueControl } from '../../../base/value-control'
import type { TDefaultValues } from '../../../base/component'
import { TAria, TChangeEvent } from '../../../../common'
import type { TEventSink } from '../../../../common'
import type { ITagsItem, ITagsItemProps, TTagsItemEvents } from './types'

/**
 * A tag identified by its value in the owner's collection.
 *
 * The encompassing root holds rootAria: without selection it is the list item
 * containing both the row and its remove button. The collection moves the
 * option role and selection state to aria on the row when selection is enabled.
 * ItemRow supplies neither a role nor a tab stop of its own and its lifetime
 * belongs to its rendering, independently of the tag's collection lifetime.
 *
 * The collection inherits size and disabled from the owner; variant stays local.
 * Own closable overrides the owner's value, and the item extension prevents
 * closing disabled tags. The names plugin writes the localized closeAria label;
 * the collection controls the close button's tab stop according to selection mode.
 */
export default class TTagsItem<
	TProps extends ITagsItemProps = ITagsItemProps,
	TEvents extends TTagsItemEvents = TTagsItemEvents,
>
	extends TValueControl<string | number, TProps, TEvents>
	implements ITagsItem<TProps, TEvents>
{
	static override baseClass = 'so-tags-item'

	static defaultValues: typeof TValueControl.defaultValues &
		TDefaultValues<ITagsItemProps, 'text', 'closable'> = {
		...TValueControl.defaultValues,
		text: '',
		value: '',
		closable: undefined,
		tag: 'div',
	}

	protected _rootAria: TAria

	protected _closeAria: TAria

	protected _text: string
	protected _closable: boolean | undefined

	constructor(props: Partial<TProps> = {}) {
		super(props)

		const ctor = new.target as typeof TTagsItem
		const customProps = props as Partial<ITagsItemProps>

		this._text = customProps.text ?? ctor.defaultValues.text

		this._closable = customProps.closable ?? ctor.defaultValues.closable

		this._rootAria = new TAria()
		this._rootAria.subscribe((_set, oldValue) =>
			this._sink.emit('change:rootAria', { newValue: this._rootAria.toObject(), oldValue }),
		)

		this._closeAria = new TAria()
		this._closeAria.subscribe((_set, oldValue) =>
			this._sink.emit('change:closeAria', { newValue: this._closeAria.toObject(), oldValue }),
		)

		this._dataset.add('closable', !!this._closable)

		// The list item includes both its row and remove button. The collection
		// moves selection semantics to the row when selection is enabled.
		this._rootAria.add('role', 'listitem')
	}

	/**
	 * Эмит собственных событий класса — без приведения `this.events` к
	 * конкретной карте (см. `TEventSink` в `common/event/types.ts`).
	 */
	protected get _sink(): TEventSink<TTagsItemEvents> {
		return this.events
	}

	/**
	 * `aria` тега стоит на вложенном `ItemRow` — строке тега. Тег у неё
	 * фиксированный (`div`), разметка задаёт его сама, поэтому от `tag` корня
	 * ARIA-половина правила «нативный атрибут вместо ARIA-дубля» не зависит:
	 * у `div` своего `disabled` нет, и состояние остаётся `aria-disabled`,
	 * каким бы ни был корень.
	 */
	protected override get _ariaTag(): string {
		return 'div'
	}

	get text(): string {
		return this._text
	}

	set text(value: string) {
		if (value === this._text) return

		const e = new TChangeEvent(value, this._text)

		this._sink.emit('change:text:before', e)

		if (e.defaultPrevented || e.value === this._text) return

		this._text = e.value
		this._sink.emit('change:text', { newValue: e.value, oldValue: e.oldValue })
	}

	/**
	 * Своё значение тега, `undefined` — наследовать от владельца.
	 *
	 * `disabled` его не трогает: правило «выключенный тег не закрывается»
	 * выводит item-адаптер (`TTagsItemExtension.closable`). Раньше оно было
	 * подпиской на `change:disabled`, которая переписывала это значение, — и
	 * у тега, выключенного со старта, не срабатывала вовсе: события нет.
	 */
	get closable(): boolean | undefined {
		return this._closable
	}

	set closable(value: boolean | undefined) {
		const oldClosable = this.closable

		if (value === this._closable) return

		const e = new TChangeEvent(value, this._closable)

		this._sink.emit('change:closable:before', e)

		if (e.defaultPrevented || e.value === this._closable) return

		this._closable = e.value
		this._dataset.add('closable', !!e.value)
		this._sink.emit('change:closable', { newValue: e.value, oldValue: oldClosable })
	}

	/**
	 * Атрибуты кнопки закрытия — отдельный набор, а не часть `aria`: `aria`
	 * описывает сам тег, а это кнопка рядом с ним. Один элемент — один набор.
	 *
	 * Живой, как `aria`, потому что пишут в него двое: имя с текстом тега
	 * («Close Настройки») — плагин имён по шаблону локали, `tabindex` —
	 * `TTagsExtension` по режиму выбора. За границу core → ui уходит снимок
	 * (`valueOf()`), об изменении набор сообщает `change:closeAria`.
	 */
	get closeAria(): TAria {
		return this._closeAria
	}

	/** Attributes of the container around the row and remove button. */
	get rootAria(): TAria {
		return this._rootAria
	}

	override getProps(): TProps {
		return {
			...super.getProps(),
			text: this.text,
			closable: this.closable,
		} as TProps
	}
}
