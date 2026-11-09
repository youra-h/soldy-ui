import type { TValuePayload } from '@soxa-ui/core'
import type { ISelect } from '@soxa-ui/core'
import { TBasePlugin } from '../../../base'
import type { IPluginContext } from '../../../base'
import { TElementPlugin } from '../../element'
import { fieldOf } from '../../input/field'
import { closestTabStop, isFocusableElement } from '../../../utils'
import type { IDomEventTarget } from '../../../utils'
import type { TSelectPointerPluginEvents } from './types'

/** Класс стрелки — единственное место клика, которое открывает/закрывает панель в `editable`. */
const ARROW_SELECTOR = '.so-select__arrow'

/**
 * TSelectPointerPlugin — указатель на поле Select: нажатие и клик.
 *
 * **Нажатие оставляет фокус в поле.** DOM-фокус комбобокса всегда на
 * `<input>` поля (APG Combobox): стрелки, Enter и Escape клавиатура берёт
 * только с него (`TSelectKeyboardPlugin`). Части поля без своей остановки Tab
 * — стрелка, коробка, ряд тегов, строки тегов, немое содержимое слотов — по
 * умолчанию уводят фокус из поля: `mousedown` по немой части уносит его на
 * `body`. Клавиши с него до поля не доходят: панель открывалась кликом по
 * стрелке или по тегу, а стрелки после этого прокручивали страницу. Поэтому
 * нажатие основной кнопкой по такой части гасится (`preventDefault`) в обоих
 * режимах, и фокус встаёт в поле, если его там нет, — как у нативного
 * `<select>` и у кнопок шага NumberInput
 * (`TNumberInputStepperPlugin`). Фокус уже в поле — он там и остаётся, без
 * `focusout`. Ставится он без прокрутки (`preventScroll`): поле, по которому
 * нажали, и так на экране, а страница не должна прыгать.
 *
 * Нажатие по остановке Tab внутри корня — по `<input>`, кнопке очистки,
 * крестику тега, кнопке потребителя в слоте — не трогается: что с ним делать,
 * остановка знает сама. Вопрос — остановка ли под нажатием, а не принимает ли
 * узел фокус вообще (`closestControl`): кроме поля, фокус в корне держат
 * только отдельные остановки. Узел, который фокус лишь принимает
 * (`tabindex="-1"`), — элемент составного виджета с roving tabindex, а таких в
 * поле нет: здесь это `-1` в слоте. У строки тега в поле `tabindex` нет
 * вовсе — теги в нём без выбора, и роль с остановкой строке пишет только
 * набор тега (`TItemRow`). Остановка под нажатием — общее правило
 * `closestTabStop` (`utils/tabStops.ts`), поле — `fieldOf`, как у
 * клавиатуры. Правило одно для мыши, пера и пальца: в select-only поле
 * только для чтения, и экранной клавиатуры у него нет, а в `editable` касание
 * стрелки ставит фокус туда же, куда касание поля.
 *
 * **Клик тумблит панель** (`ISelect.toggleOpen()`): в select-only — клик по
 * всему полю, в `editable` — только по стрелке (`.so-select__arrow`), а клик
 * по тексту поля ставит курсор и ничего не открывает. Режим плагин знает по
 * `change:editable`.
 *
 * Слушает сам корень (тот же элемент, что у `TDismissPlugin`/клавиатуры),
 * поэтому клик по вложенному `<input>` и по кнопке очистки (она сама
 * останавливает всплытие) доходят одинаково во всех шести адаптерах —
 * разметке про режим знать не нужно.
 */
export class TSelectPointerPlugin extends TBasePlugin<any, TSelectPointerPluginEvents> {
	private _owner: ISelect | null = null
	/** Корень Select: на нём слушатели, в нём ищутся остановка под нажатием и поле. */
	private _root: Element | null = null
	private _editable = false
	/** WebKit retargets a touch on the label's arrow to its associated input. */
	private _touchArrow = false

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		this._owner = ctx.getInstance<ISelect>() ?? null
		this._editable = Boolean(this._owner?.editable)

		const elementPlugin = ctx.get(TElementPlugin)

		elementPlugin?.events.on('ready', (element) => this._bind(element))
		elementPlugin?.events.on('removed', () => this._bind(null))

		this._listenTo(
			this._owner?.events,
			'change:editable',
			({ newValue: value }: TValuePayload<boolean>) => {
				this._editable = value
			},
		)
	}

	override destroy(): void {
		this._bind(null)
		this._owner = null

		super.destroy()
	}

	/** Корень сменился — слушатели переезжают на новый. */
	private _bind(root: Element | null): void {
		const previous: IDomEventTarget | null = this._root

		previous?.removeEventListener('click', this._onClick)
		previous?.removeEventListener('pointerdown', this._onPointerDown)
		previous?.removeEventListener('pointercancel', this._onPointerCancel)
		previous?.removeEventListener('mousedown', this._onMouseDown)

		this._touchArrow = false
		this._root = root

		const target: IDomEventTarget | null = root

		target?.addEventListener('click', this._onClick)
		target?.addEventListener('pointerdown', this._onPointerDown)
		target?.addEventListener('pointercancel', this._onPointerCancel)
		target?.addEventListener('mousedown', this._onMouseDown)
	}

	private _isArrow(target: EventTarget | null): boolean {
		return target instanceof Element && !!target.closest(ARROW_SELECTOR)
	}

	/** Preserve the physical target before WebKit label activation retargets the click. */
	private readonly _onPointerDown = (event: PointerEvent): void => {
		this._touchArrow = event.pointerType === 'touch' && this._isArrow(event.target)
	}

	private readonly _onPointerCancel = (): void => {
		this._touchArrow = false
	}

	/** Toggle by the original arrow target in editable mode, or anywhere in select-only mode. */
	private readonly _onClick = (event: MouseEvent): void => {
		const root = this._root
		if (event.detail === 0 && root && event.target instanceof Element) {
			const field = fieldOf(root)
			const stop = closestTabStop(event.target, root)
			// Click-only activation has no pointerdown to move DOM focus into the field.
			if ((!stop || stop === field) && isFocusableElement(field)) {
				field.focus({ preventScroll: true })
			}
		}
		const arrow = this._isArrow(event.target) || (this._touchArrow && event.detail > 0)
		this._touchArrow = false
		if (this._editable) {
			if (arrow) this._owner?.toggleOpen()

			return
		}

		this._owner?.toggleOpen()
	}

	/** Нажатие мимо остановок Tab поля фокус из поля не уводит, а снаружи — ставит в него. */
	private readonly _onMouseDown = (event: MouseEvent): void => {
		const root = this._root
		const target = event.target

		if (!root || event.button !== 0 || !(target instanceof Element)) return
		if (closestTabStop(target, root)) return

		event.preventDefault()

		const field = fieldOf(root)

		if (isFocusableElement(field) && root.ownerDocument.activeElement !== field) {
			field.focus({ preventScroll: true })
		}
	}
}
