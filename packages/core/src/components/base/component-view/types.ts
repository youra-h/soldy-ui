import type { TValuePayload } from '../../../common'
import type {
	TAriaAttributes,
	TAria,
	TDatasetAttributes,
	TDataset,
	TAttributesMap,
	TAttributes,
	TClasses,
} from './../../../common'
import type { TActionEvent, TChangeEvent } from '../../../common'
import type { IComponent, IComponentProps, TComponentEvents } from '../component'

/**
 * Направление письма.
 *
 * `'inherit'` (значение по умолчанию) означает «не задавать `dir` вовсе» —
 * элемент наследует направление от предка (в т.ч. от `<html dir>`). Отдельного
 * `undefined` нет намеренно: writable-проп обязан иметь конкретное значение,
 * иначе его нельзя вернуть в исходное состояние через механизм синхронизации
 * (он везде трактует `undefined` как «не трогать»).
 */
export type TDirection = 'ltr' | 'rtl' | 'inherit'

export type TComponentViewEvents = TComponentEvents & {
	/** show */
	show: () => void
	/** hide */
	hide: () => void
	/** show:before — вызов e.preventDefault() отменяет показ */
	'show:before': (e: TActionEvent) => void
	/** hide:before — вызов e.preventDefault() отменяет скрытие */
	'hide:before': (e: TActionEvent) => void

	/** change:visible */
	'change:visible': (payload: TValuePayload<boolean>) => void
	/** change:rendered */
	'change:rendered': (payload: TValuePayload<boolean>) => void
	/** Запись `rendered` — подправить или отменить (`TChangeEvent`). У `visible` то же делают `show:before` и `hide:before` */
	'change:rendered:before': (e: TChangeEvent<boolean>) => void
	/** change:present — rendered && visible */
	'change:present': (payload: TValuePayload<boolean>) => void

	/** change:tag */
	'change:tag': (payload: TValuePayload<string | object>) => void
	/** change:direction */
	'change:direction': (payload: TValuePayload<TDirection>) => void
	/** change:classes (без baseClass) */
	'change:classes': (payload: TValuePayload<string[]>) => void
	/** change:aria — набор атрибутов доступности изменился */
	'change:aria': (payload: TValuePayload<TAriaAttributes>) => void
	/** change:dataset — набор `data-*` изменился */
	'change:dataset': (payload: TValuePayload<TDatasetAttributes>) => void
	/** change:attrs — набор нативных атрибутов изменился */
	'change:attrs': (payload: TValuePayload<TAttributesMap>) => void
	/**
	 * Component availability changed: true when the instance has an announced
	 * root DOM element, false when that root is removed or replaced.
	 * Does not wait for other plugins' DOM handlers or asynchronous work.
	 */
	ready: (value: boolean) => void
}

export interface IComponentViewProps extends IComponentProps {
	/** Отрисован ли компонент (аналог v-if) */
	rendered?: boolean
	/** Виден ли компонент (логическая видимость) */
	visible?: boolean
	tag?: string | object
	/** Направление письма; по умолчанию `'inherit'` — наследуется от предка */
	direction?: TDirection
}

export interface IComponentViewMethods {
	/** Показать компонент */
	show(): void
	/** Скрыть компонент */
	hide(): void
}

export interface IComponentView<
	TProps extends IComponentViewProps = IComponentViewProps,
	TEvents extends Record<string, (...args: any) => any> = TComponentViewEvents,
>
	extends IComponent<TProps, TEvents>, IComponentViewMethods {
	/** Отрисован в DOM */
	rendered: boolean
	/** Логическая видимость */
	visible: boolean
	/** Компонент на экране: rendered && visible */
	readonly present: boolean
	/** HTML-тег или компонент */
	tag: string | object
	/** Направление письма (`'inherit'` — наследуется от предка) */
	direction: TDirection
	/** CSS-классы (включая baseClass и динамические) */
	readonly classes: TClasses
	/** Атрибуты доступности — живой набор, как `classes` */
	readonly aria: TAria
	/** `data-*` для темы — такой же живой набор, но другой контракт */
	readonly dataset: TDataset
	/**
	 * Нативные атрибуты, зависящие от тега корня (`disabled` у кнопки/поля) —
	 * третий набор рядом с `aria`/`dataset`
	 */
	readonly attrs: TAttributes
	/**
	 * Component availability, maintained by TReadyPlugin: the instance exists
	 * and its root DOM element has been announced. Initially false; returns to
	 * false when the root is removed, and to true when a root is announced again.
	 * Does not imply visibility or completion of other plugins' DOM handlers
	 * or asynchronous work. Read this flag when subscribing after mounting:
	 * the ready event only reports changes and does not replay the current value.
	 */
	ready: boolean
}
