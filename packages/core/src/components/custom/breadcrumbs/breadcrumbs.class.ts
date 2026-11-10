import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import { TAria } from '../../../common'
import { breadcrumbsLimit, breadcrumbsWindow, sameBreadcrumbs } from './window'
import type { IBreadcrumbs, IBreadcrumbsProps, TBreadcrumbsEvents, TBreadcrumbsItem } from './types'

/** Ordered page navigation with a deterministic, server-renderable overflow window. */
export default class TBreadcrumbs
	extends TStylable<IBreadcrumbsProps, TBreadcrumbsEvents>
	implements IBreadcrumbs
{
	static override baseClass = 'so-breadcrumbs'
	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<IBreadcrumbsProps, 'items' | 'maxItems'> = {
		...TStylable.defaultValues,
		tag: 'nav',
		items: [],
		maxItems: 5,
	}

	protected _items: readonly TBreadcrumbsItem[]
	protected _maxItems: number
	protected _overflowAria = new TAria()

	constructor(props: Partial<IBreadcrumbsProps> = {}) {
		super(props)

		const ctor = new.target as typeof TBreadcrumbs

		this._items = props.items ?? ctor.defaultValues.items
		this._maxItems = breadcrumbsLimit(props.maxItems ?? ctor.defaultValues.maxItems)
		this._attrs.add('tabindex', '-1')
		this._aria.add('role', 'navigation')

		this._overflowAria.subscribe((_set, oldValue) =>
			this.events.emit('change:overflowAria', {
				newValue: this._overflowAria.toObject(),
				oldValue,
			}),
		)
	}

	get items(): readonly TBreadcrumbsItem[] {
		return this._items
	}

	set items(value: readonly TBreadcrumbsItem[]) {
		if (sameBreadcrumbs(this._items, value)) return

		const oldValue = this._items

		this._items = value
		this.events.emit('change:items', { newValue: value, oldValue })
	}

	get maxItems(): number {
		return this._maxItems
	}

	set maxItems(value: number) {
		const normalized = breadcrumbsLimit(value)

		if (normalized === this._maxItems) return

		const oldValue = this._maxItems

		this._maxItems = normalized
		this.events.emit('change:maxItems', { newValue: normalized, oldValue })
	}

	get entries() {
		return breadcrumbsWindow(this.items, this.maxItems).entries
	}

	get hiddenEntries() {
		return breadcrumbsWindow(this.items, this.maxItems).hiddenEntries
	}

	get overflowAria(): TAria {
		return this._overflowAria
	}

	override getProps(): IBreadcrumbsProps {
		return { ...super.getProps(), items: this.items, maxItems: this.maxItems }
	}
}
