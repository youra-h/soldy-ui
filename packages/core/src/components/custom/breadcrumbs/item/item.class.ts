import { TTextable } from '../../../base/textable'
import type { TDefaultValues } from '../../../base/component'
import { TChangeEvent } from '../../../../common'
import type { IBreadcrumbsItem, IBreadcrumbsItemProps, TBreadcrumbsItemEvents } from './types'

/**
 * Text and native link attributes for one location.
 * Its collection facade supplies activation; an omitted href presents a text-only location.
 */
export default class TBreadcrumbsItem
	extends TTextable<IBreadcrumbsItemProps, TBreadcrumbsItemEvents>
	implements IBreadcrumbsItem
{
	static override baseClass = 'so-breadcrumbs-item'
	static defaultValues: typeof TTextable.defaultValues &
		TDefaultValues<IBreadcrumbsItemProps, never, 'href' | 'target' | 'rel'> = {
		...TTextable.defaultValues,
		tag: 'li',
		href: undefined,
		target: undefined,
		rel: undefined,
	}

	protected _href: string | undefined
	protected _target: string | undefined
	protected _rel: string | undefined

	constructor(props: Partial<IBreadcrumbsItemProps> = {}) {
		super(props)

		const ctor = new.target as typeof TBreadcrumbsItem

		this._href = props.href ?? ctor.defaultValues.href
		this._target = props.target ?? ctor.defaultValues.target
		this._rel = props.rel ?? ctor.defaultValues.rel
		this._syncLink()
	}

	// Control ARIA belongs to the inner anchor; the item's structural root is an li.
	protected override get _ariaTag(): string {
		return 'a'
	}

	get href(): string | undefined {
		return this._href
	}

	set href(value: string | undefined) {
		if (value === this._href) return

		const event = new TChangeEvent(value, this._href)
		this.events.emit('change:href:before', event)

		if (event.defaultPrevented || event.value === this._href) return

		this._href = event.value
		this._syncLink()
		this.events.emit('change:href', { newValue: event.value, oldValue: event.oldValue })
	}

	get target(): string | undefined {
		return this._target
	}

	set target(value: string | undefined) {
		if (value === this._target) return

		const event = new TChangeEvent(value, this._target)
		this.events.emit('change:target:before', event)

		if (event.defaultPrevented || event.value === this._target) return

		this._target = event.value
		this._syncLink()
		this.events.emit('change:target', { newValue: event.value, oldValue: event.oldValue })
	}

	get rel(): string | undefined {
		return this._rel
	}

	set rel(value: string | undefined) {
		if (value === this._rel) return

		const event = new TChangeEvent(value, this._rel)
		this.events.emit('change:rel:before', event)

		if (event.defaultPrevented || event.value === this._rel) return

		this._rel = event.value
		this._syncLink()
		this.events.emit('change:rel', { newValue: event.value, oldValue: event.oldValue })
	}

	protected override _syncDisabled(): void {
		super._syncDisabled()
		this._syncLink()
	}

	/** Suppress native navigation while disabled, retaining href for a later re-enable. */
	private _syncLink(): void {
		for (const name of ['href', 'target', 'rel'] as const) {
			const value = name === 'href' && this.disabled ? undefined : this[name]
			if (value === undefined) this._attrs.remove(name)
			else this._attrs.add(name, value)
		}
	}

	override getProps(): IBreadcrumbsItemProps {
		return {
			...super.getProps(),
			href: this.href,
			target: this.target,
			rel: this.rel,
		}
	}
}
