import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import { TAria, TChangeEvent } from '../../../common'
import type { IBreadcrumbs, IBreadcrumbsProps, TBreadcrumbsEvents } from './types'

/**
 * Navigation landmark and display limit for a breadcrumb collection.
 * Membership, ordering and the current location belong to the collection extensions.
 */
export default class TBreadcrumbs
	extends TStylable<IBreadcrumbsProps, TBreadcrumbsEvents>
	implements IBreadcrumbs
{
	static override baseClass = 'so-breadcrumbs'
	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<IBreadcrumbsProps, 'maxItems'> = {
		...TStylable.defaultValues,
		tag: 'nav',
		maxItems: 5,
	}

	protected _maxItems: number

	protected _overflowAria = new TAria()

	constructor(props: Partial<IBreadcrumbsProps> = {}) {
		super(props)

		const ctor = new.target as typeof TBreadcrumbs

		this._maxItems = this._limit(props.maxItems ?? ctor.defaultValues.maxItems)

		// Focus repair can return to an empty trail without adding a normal Tab stop.
		this._attrs.add('tabindex', '-1')
		this._aria.add('role', 'navigation')
		this._overflowAria.subscribe((_set, oldValue) =>
			this.events.emit('change:overflowAria', {
				newValue: this._overflowAria.toObject(),
				oldValue,
			}),
		)
	}

	get maxItems(): number {
		return this._maxItems
	}

	set maxItems(value: number) {
		const normalized = this._limit(value)
		if (normalized === this._maxItems) return
		const event = new TChangeEvent(normalized, this._maxItems)

		this.events.emit('change:maxItems:before', event)

		if (event.defaultPrevented) return

		const next = this._limit(event.value)
		if (next === this._maxItems) return
		const oldValue = this._maxItems
		this._maxItems = next
		this.events.emit('change:maxItems', { newValue: next, oldValue })
	}

	get overflowAria(): TAria {
		return this._overflowAria
	}

	// An overflowing trail needs room for the first item, the menu and the final item.
	private _limit(value: number): number {
		return value === 0
			? 0
			: Number.isFinite(value) && value > 0
				? Math.max(3, Math.floor(value))
				: 5
	}

	override getProps(): IBreadcrumbsProps {
		return { ...super.getProps(), maxItems: this.maxItems }
	}
}
